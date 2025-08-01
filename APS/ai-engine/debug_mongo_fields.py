from pymongo import MongoClient
import pandas as pd

client = MongoClient("mongodb://localhost:27017/")
db = client['pollutiondb']
collection = db['pollutions']

data = list(collection.find())
if data:
    print("✅ Sample document fields:")
    print(data[0])
else:
    print("❌ No data found")
