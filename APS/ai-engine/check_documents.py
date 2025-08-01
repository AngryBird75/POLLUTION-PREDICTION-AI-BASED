from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client['pollutiondb']
collection = db['pollution']  # ✅ This must match your actual collection

sample = collection.find_one()
if sample:
    print("✅ Sample document from 'pollution' collection:\n")
    for key, value in sample.items():
        print(f"{key}: {value}")
else:
    print("❌ No documents found in 'pollution'")
