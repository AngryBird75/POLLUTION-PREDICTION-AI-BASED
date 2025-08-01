from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests (important for Node.js integration)

# Load trained model
model = joblib.load('pollution_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        temperature = float(data.get('temperature'))
        humidity = float(data.get('humidity'))
        wind_speed = float(data.get('wind_speed'))

        # Format for model input
        features = np.array([[temperature, humidity, wind_speed]])
        prediction = model.predict(features)

        return jsonify({
            'predicted_aqi': round(prediction[0], 2),
            'input': {
                'temperature': temperature,
                'humidity': humidity,
                'wind_speed': wind_speed
            }
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
