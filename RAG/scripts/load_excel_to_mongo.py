import pandas as pd
from pymongo import MongoClient

EXCEL_PATH = "data/Categorized_Locations.xlsx"
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