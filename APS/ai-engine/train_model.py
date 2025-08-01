import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import joblib

# Load CSV dataset
data = pd.read_csv('pollution_data.csv')  # Make sure this file exists

# Features and target
X = data[['temperature', 'humidity', 'wind_speed']]
y = data['aqi']

# Split into training/testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = LinearRegression()
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print(f"Mean Squared Error: {mean_squared_error(y_test, y_pred)}")
print(f"R2 Score: {r2_score(y_test, y_pred)}")

# Save model to file
joblib.dump(model, 'pollution_model.pkl')
print("Model saved as 'pollution_model.pkl'")
