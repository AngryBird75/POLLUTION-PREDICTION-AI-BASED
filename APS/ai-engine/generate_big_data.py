# generate_big_data.py
import random
import datetime
from pymongo import MongoClient
import joblib
import numpy as np

# Load your model
model = joblib.load("pollution_model.pkl")

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["pollutiondb"]
collection = db["records"]

# Sample cities per country (you can expand this)
locations = {
    "Pakistan": ["Lahore", "Karachi", "Islamabad"],
    "USA": ["New York", "Los Angeles", "Chicago"],
    "India": ["Delhi", "Mumbai", "Chennai"],
    "UK": ["London", "Manchester", "Birmingham"],
    "China": ["Beijing", "Shanghai", "Guangzhou"]
}

start_date = datetime.date.today() - datetime.timedelta(days=730)  # 2 years back
end_date = datetime.date.today()

current_date = start_date
total_inserted = 0

while current_date <= end_date:
    for country, cities in locations.items():
        for city in cities:
            # Random input values (you can refine these)
            temperature = random.uniform(10, 40)
            humidity = random.uniform(20, 90)
            wind_speed = random.uniform(1, 10)

            features = np.array([[temperature, humidity, wind_speed]])
            prediction = model.predict(features)[0]

            doc = {
                "date": current_date.isoformat(),
                "country": country,
                "city": city,
                "temperature": temperature,
                "humidity": humidity,
                "wind_speed": wind_speed,
                "predicted_pollution": round(prediction, 2)
            }

            collection.insert_one(doc)
            total_inserted += 1

    current_date += datetime.timedelta(days=1)

print(f"✅ Inserted {total_inserted} records.")
