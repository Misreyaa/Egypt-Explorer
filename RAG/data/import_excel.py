import pandas as pd
from pymongo import MongoClient

# MongoDB connection
uri = "mongodb+srv://mariamelkondakly88_db_user:VXNPTFlECyywG3F5@cluster0.byznfgr.mongodb.net/?appName=Cluster0"

# Create a new client and connect to the server
client = MongoClient(uri)

db = client["egyreal"]
collection = db["destinations"]

# Load Excel file
df = pd.read_excel("Categorized_Locations.xlsx")

# Replace NaN with None
df = df.where(pd.notnull(df), None)

# Convert to list of dicts
records = df.to_dict(orient="records")

# Insert into MongoDB
collection.insert_many(records)

print(f"Inserted {len(records)} documents into destinations collection.")
