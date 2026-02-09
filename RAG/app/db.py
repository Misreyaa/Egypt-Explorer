
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

uri = "mongodb+srv://mariamelkondakly88_db_user:VXNPTFlECyywG3F5@cluster0.byznfgr.mongodb.net/?appName=Cluster0"

# Create a new client and connect to the server
client = MongoClient(uri, server_api=ServerApi('1'))

db = client["egyreal"]

# Collections
destinations_collection = db["destinations"]
tourists_collection = db["tourists"]
locals_collection = db["locals"]
posts_collection = db["posts"]
shops_collection = db["shops"]
vehicles_collection = db["vehicles"]