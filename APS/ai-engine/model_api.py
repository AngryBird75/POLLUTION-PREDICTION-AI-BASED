from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)

model = joblib.load('pollution_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        temperature = float(data.get('temperature', 25))
        humidity = float(data.get('humidity', 50))
        wind_speed = float(data.get('wind_speed', 1))

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
