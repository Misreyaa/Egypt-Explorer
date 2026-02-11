import ast

import pandas as pd
from pymongo import MongoClient

EXCEL_PATH = "data/Locations.xlsx"
MONGODB_URI = "mongodb://localhost:27017"
MONGODB_DB = "egyreal"

client = MongoClient(MONGODB_URI)
db = client[MONGODB_DB]
destinations = db["destinations"]


def safe_text(value):
    """Return a UTF‑8 safe string or None."""
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None

    # If it's bytes, decode with replacement
    if isinstance(value, (bytes, bytearray)):
        return value.decode("utf-8", errors="replace").strip()

    # Fallback: stringify and re-encode/decode to normalize
    s = str(value)
    return s.encode("utf-8", errors="replace").decode("utf-8").strip()


def parse_list_cell(value):
    """
    Normalize Excel cells that represent lists into real Python lists of strings.

    Handles cases like:
    - \"['a', 'b']\" (Python-list-like string)
    - \"a, b, c\" (comma-separated)
    - single plain strings → [string]
    - NaN / empty → []
    """
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return []

    # Already a list
    if isinstance(value, list):
        return [safe_text(v) for v in value if safe_text(v)]

    # Text representation
    if isinstance(value, (str, bytes, bytearray)):
        text = safe_text(value) or ""
        if not text:
            return []

        # Try to parse Python-list-like strings: "['a', 'b']"
        if text.startswith("[") and text.endswith("]"):
            try:
                parsed = ast.literal_eval(text)
                if isinstance(parsed, list):
                    return [safe_text(v) for v in parsed if safe_text(v)]
            except (ValueError, SyntaxError):
                # Fall back to treating it as a plain string below
                pass

        # Fallback: treat as comma-separated list
        if "," in text:
            return [safe_text(part) for part in text.split(",") if safe_text(part)]

        # Single value
        single = safe_text(text)
        return [single] if single else []

    # Any other type → wrap as single element list
    single = safe_text(value)
    return [single] if single else []


def import_excel_to_mongo(path: str = EXCEL_PATH):
    df = pd.read_excel(path)
    df.columns = df.columns.str.lower().str.replace(" ", "_")

    for _, row in df.iterrows():
        # Ensure we have a primary key for upserts
        raw_place_id = row.get("place_id")
        place_id = safe_text(raw_place_id)
        if not place_id:
            continue

        doc = {}

        for col in df.columns:
            value = row.get(col)

            # Skip completely empty values
            if isinstance(value, float) and pd.isna(value):
                continue

            # Always store place_id as a normalized string
            if col == "place_id":
                doc["place_id"] = place_id
                continue

            # Normalize list-like fields to actual lists of strings
            if col in {"activities", "tags", "sources"}:
                doc[col] = parse_list_cell(value)
                continue

            # For textual/bytes fields, sanitize to UTF‑8-safe strings
            if isinstance(value, (str, bytes, bytearray)):
                doc[col] = safe_text(value)
            else:
                # Non-text (numbers, booleans, etc.) can be stored as-is
                doc[col] = value

        destinations.update_one(
            {"place_id": place_id},
            {"$set": doc},
            upsert=True,
        )

    print("Done importing destinations into MongoDB.")


if __name__ == "__main__":
    import_excel_to_mongo()