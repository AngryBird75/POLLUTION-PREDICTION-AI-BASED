from pymongo import MongoClient

client = MongoClient('mongodb://localhost:27017')
db = client['pollutiondb']
collection = db['pollution']

# Delete documents that don't have valid AQI values
result1 = collection.delete_many({'aqi': {'$exists': False}})
result2 = collection.delete_many({'aqi': None})
result3 = collection.delete_many({'aqi': 'NaN'})
result4 = collection.delete_many({'aqi': float('nan')})  # might not match but safe to include

print("✅ Cleanup complete:")
print(f" - Missing AQI: {result1.deleted_count}")
print(f" - Null AQI: {result2.deleted_count}")
print(f" - String 'NaN' AQI: {result3.deleted_count}")
print(f" - float('nan') AQI: {result4.deleted_count}")
