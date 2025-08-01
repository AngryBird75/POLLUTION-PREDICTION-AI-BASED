# train_model.py
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# ✅ Generate synthetic training data (you can replace this with real data)
np.random.seed(42)
num_samples = 1000

temperature = np.random.uniform(5, 45, num_samples)
humidity = np.random.uniform(10, 90, num_samples)
wind_speed = np.random.uniform(0.5, 12, num_samples)

# Pollution (AI target) = a fake function for simulation
pollution = 0.5 * temperature + 0.3 * humidity - 0.7 * wind_speed + np.random.normal(0, 5, num_samples)

# Create DataFrame
df = pd.DataFrame({
    'temperature': temperature,
    'humidity': humidity,
    'wind_speed': wind_speed,
    'pollution': pollution
})

# Train model
X = df[['temperature', 'humidity', 'wind_speed']]
y = df['pollution']

model = LinearRegression()
model.fit(X, y)

# Evaluate
y_pred = model.predict(X)
mse = mean_squared_error(y, y_pred)
r2 = r2_score(y, y_pred)

print("✅ Model trained")
print("Mean Squared Error:", mse)
print("R2 Score:", r2)

# Save model
joblib.dump(model, 'pollution_model.pkl')
print("📁 Model saved as 'pollution_model.pkl'")
