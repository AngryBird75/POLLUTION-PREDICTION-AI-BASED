from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client['pollutiondb']
print("✅ Collections found:", db.list_collection_names())
