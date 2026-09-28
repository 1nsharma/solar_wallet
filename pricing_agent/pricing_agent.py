# pricing_agent/pricing_agent.py
"""Pricing Agent

This Python service provides dynamic electricity pricing based on recent grid telemetry.
It subscribes to MQTT telemetry, runs a lightweight ML model (placeholder LSTM), and
exposes a Flask API endpoint `/price` returning the current price.
"""

import os
import json
import time
from threading import Thread

import paho.mqtt.client as mqtt
import numpy as np
from flask import Flask, jsonify

# ------------------- Configuration -------------------
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "solar/telemetry")

# Simple placeholder model – in production replace with a trained LSTM.
class SimplePricingModel:
    def __init__(self):
        self.last_price = 5.0  # base price in INR/kWh

    def predict(self, telemetry):
        # Very naive pricing: increase price when load > 80% of capacity
        load = telemetry.get("load_percent", 0)
        price = self.last_price * (1 + max(0, (load - 80) / 200))
        self.last_price = round(price, 2)
        return self.last_price

model = SimplePricingModel()
latest_telemetry = {}

# ------------------- MQTT Callbacks -------------------
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("Connected to MQTT broker")
        client.subscribe(MQTT_TOPIC)
    else:
        print(f"Failed to connect, return code {rc}")

def on_message(client, userdata, msg):
    global latest_telemetry
    try:
        payload = json.loads(msg.payload.decode())
        latest_telemetry = payload
        # Update price based on new telemetry
        model.predict(payload)
    except Exception as e:
        print(f"Error processing MQTT message: {e}")

mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

# ------------------- Flask API -------------------
app = Flask(__name__)

@app.route("/price", methods=["GET"])
def get_price():
    price = model.last_price
    response = {"price": price, "timestamp": int(time.time())}
    return jsonify(response)

def start_mqtt():
    mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
    mqtt_client.loop_forever()

if __name__ == "__main__":
    # Run MQTT listener in a background thread
    Thread(target=start_mqtt, daemon=True).start()
    # Start Flask API
    app.run(host="0.0.0.0", port=5000)
