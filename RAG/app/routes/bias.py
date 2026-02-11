import base64
import json
import os
import re
from typing import List, Optional

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException, Request
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()

router = APIRouter()

SYSTEM_PROMPT = """You are a neutral cultural context assistant for Egypt Explorer.

Your task is to analyze a user's statement about Egypt or Egyptians and gently identify possible cultural bias or overgeneralization, if any.

You must evaluate the text using the following four bias KPIs, each scored from 0 to 100:

1) Language Spectrum: KPI Measures emotionally loaded or judgmental language versus neutral description. (0 = fully neutral, 100 = highly judgmental)

2) Scope of Generalization: KPI Measures whether a single experience is applied to a whole group or country. (0 = specific personal experience, 100 = broad claims about all Egyptians)

3) Cultural Lens: KPI Measures judgment based on the author's own cultural standards
without acknowledging local context. (0 = no comparison, 100 = strong foreign-standard judgment)

4) Omission: KPI Measures whether the statement presents only one side of an experience without balance or variation. (0 = balanced view, 100 = entirely one-sided)

Bias Percentage Calculation:

After scoring each KPI, calculate the overall Bias Percentage using this weighted average:
Scope of Generalization: 35%
Language Spectrum: 25%
Cultural Lens: 25%
Omission: 15%

Bias % =
(Language × 0.25) +
(Generalization × 0.35) +
(Cultural Lens × 0.25) +
(Omission × 0.15)

| Bias %  | Level | Label         |
| ------- | ----- | ------------- |
| 0–20%   | 1     | Objective     |
| 21–40%  | 2     | Opinionated   |
| 41–60%  | 3     | Leaning       |
| 61–80%  | 4     | Biased        |
| 81–100% | 5     | Highly Biased |

You MUST always compute:
- biasPercentage
- biasLevel (integer 1–5)
- biasLabel (exact table text)



Internal Explainability Logs (REQUIRED):

For every analyzed text, you must internally generate structured reviewer logs explaining how the decision was reached.

These logs are NOT shown to the user and must NOT change the public JSON output schema.

Internal structure:

{
  "internalEvaluation": {
    "languageSpectrumScore": <0–100>,
    "generalizationScore": <0–100>,
    "culturalLensScore": <0–100>,
    "omissionScore": <0–100>,
    "weightedBiasPercentage": <calculated number>,
    "triggeredThreshold": <true if biasPercentage ≥ 40, else false>,
    "notes": [
      "Short evidence phrase from the text explaining each score",
      "Focus on wording, scope, comparison, or missing balance"
    ]
  }
}

Behavioral Rules:
- Use simple everyday language
- Do not introduce outside facts or statistics
- Do not judge or shame
- Limit bias types to max 1–2
- Acknowledge real concerns if present
- Be brief and calm
- If no meaningful bias → clearly say so

Allowed Bias Types (use exact labels only):
- Stereotyping
- Orientalism
- Economic Assumptions
- Religious Oversimplification
- Overgeneralization

Public Output (STRICT JSON ONLY):
Respond with structured JSON only, using exactly the schema below. Do not include internal logs or explanations outside this JSON.
The response must be valid JSON with no trailing text, markdown, or comments.
{
  "hasBias": true,
  "biasPercentage": 0,
  "biasLevel": 1,
  "biasLabel": "Objective | Opinionated | Leaning | Biased | Highly Biased",
  "summary": "One short sentence.",
  "biases": [
    {
      "type": "...",
      "note": "One sentence."
    }
  ],
  "context": "One short helpful sentence."
}

If the input text is empty, unreadable, or unrelated to Egypt or Egyptians, return:
{
  "hasBias": false,
  "biasPercentage": 0,
  "biasLevel": 1,
  "biasLabel": "Objective",
  "summary": "No relevant statement to analyze.",
  "biases": [],
  "context": ""
}


If no meaningful bias:
"hasBias": false
"biasPercentage": 0
"biases": []
explain briefly in "summary"""


class BiasItem(BaseModel):
    type: str
    note: str


class BiasResponse(BaseModel):
    hasBias: bool
    biasPercentage: int
    biasLevel: int
    biasLabel: str
    summary: str
    biases: List[BiasItem]
    context: str


def _parse_json_from_model(raw: str) -> dict:
    """Parse JSON from model output, stripping optional markdown code block."""
    s = (raw or "").strip()
    # Remove ```json ... ``` wrapper if present
    m = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", s)
    if m:
        s = m.group(1).strip()
    return json.loads(s)


def _normalize_response(parsed: dict) -> dict:
    """Ensure biasPercentage and biasLevel are int for response model."""
    out = dict(parsed)
    if "biasPercentage" in out and out["biasPercentage"] is not None:
        out["biasPercentage"] = int(round(float(out["biasPercentage"])))
    if "biasLevel" in out and out["biasLevel"] is not None:
        out["biasLevel"] = int(out["biasLevel"])
    return out


@router.post("/analyze", response_model=BiasResponse)
async def analyze_bias(request: Request):
    # 1) Validate OpenAI API key
    api_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="OpenAI API key is not configured. Set OPENAI_API_KEY in your environment or .env file.",
        )
    client = OpenAI(api_key=api_key)

    # 2) Extract text and/or image from request (JSON or multipart)
    text: Optional[str] = None
    image_bytes: Optional[bytes] = None
    image_media_type: str = "image/png"

    content_type = (request.headers.get("content-type") or "").lower()

    if "application/json" in content_type:
        try:
            body = await request.json()
            text = (body.get("text") or "").strip() or None
        except Exception:
            text = None
    elif "multipart/form-data" in content_type:
        try:
            form = await request.form()
            # Text field
            text_field = form.get("text")
            if text_field is not None:
                if hasattr(text_field, "read"):
                    text = (await text_field.read()).decode("utf-8", errors="replace").strip() or None
                else:
                    text = (str(text_field).strip() or None)
            # Image file
            file = form.get("image")
            if file and hasattr(file, "read"):
                image_bytes = await file.read()
                # Prefer actual content type for data URL we send to OpenAI
                ct = getattr(file, "content_type", None) or ""
                if "jpeg" in ct or "jpg" in ct:
                    image_media_type = "image/jpeg"
                elif "webp" in ct:
                    image_media_type = "image/webp"
                elif "png" in ct or not ct:
                    image_media_type = "image/png"
        except Exception:
            pass

    # 3) If image provided and no text, extract text via Vision
    if image_bytes and not text:
        img_b64 = base64.b64encode(image_bytes).decode("utf-8")
        data_url = f"data:{image_media_type};base64,{img_b64}"
        try:
            vision = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Extract all readable text from this image only. If there is no text, respond with the single word: NONE"},
                            {"type": "image_url", "image_url": {"url": data_url}},
                        ],
                    }
                ],
                temperature=0,
            )
            raw_text = (vision.choices[0].message.content or "").strip()
            if raw_text and raw_text.upper() != "NONE":
                text = raw_text
        except Exception as e:
            raise HTTPException(
                status_code=502,
                detail=f"Failed to extract text from image: {str(e)}",
            )

    # 4) No text to analyze
    if not text:
        return BiasResponse(
            hasBias=False,
            biasPercentage=0,
            biasLevel=1,
            biasLabel="Objective",
            summary="No relevant statement to analyze.",
            biases=[],
            context="",
        )

    # 5) Run bias analysis
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": text},
            ],
            temperature=0,
            response_format={"type": "json_object"},
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"OpenAI API error: {str(e)}")

    raw = completion.choices[0].message.content
    try:
        parsed = _parse_json_from_model(raw)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"Invalid JSON from model: {e}")

    parsed = _normalize_response(parsed)
    return BiasResponse(**parsed)
