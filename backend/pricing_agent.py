# pricing_agent.py
# ---------------------------------------------------
# Dynamic Pricing Agent for SolarSync
# ---------------------------------------------------
# Listens to MQTT telemetry from ESP32 devices, computes a
# price based on supply/demand balance, and exposes the
# current rate via a tiny FastAPI HTTP endpoint.
# ---------------------------------------------------

import os
import json
import asyncio
from collections import deque
from typing import Deque

import paho.mqtt.client as mqtt
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import uvicorn

# ---------------------------------------------------
# Configuration (environment variables)
# ---------------------------------------------------
MQTT_BROKER = os.getenv("MQTT_BROKER", "localhost")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
MQTT_USER = os.getenv("MQTT_USER", "")
MQTT_PASS = os.getenv("MQTT_PASS", "")
MQTT_TOPIC = os.getenv("MQTT_TOPIC", "solar_sync/+/telemetry")

# Number of recent samples to keep for smoothing
WINDOW_SIZE = int(os.getenv("PRICING_WINDOW", "20"))

# Base price (₹ per kWh) and adjustment factor
BASE_PRICE = float(os.getenv("BASE_PRICE", "6.5"))
ADJ_FACTOR = float(os.getenv("ADJ_FACTOR", "0.02"))

app = FastAPI()

# Deque for recent power values (kW)
power_samples: Deque[float] = deque(maxlen=WINDOW_SIZE)

# Current price (shared state)
current_price = BASE_PRICE

# ---------------------------------------------------
# MQTT callbacks
# ---------------------------------------------------
def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("[PricingAgent] MQTT connected")
        client.subscribe(MQTT_TOPIC)
    else:
        print(f"[PricingAgent] MQTT connection failed: {rc}")

def on_message(client, userdata, msg):
    try:
        payload = json.loads(msg.payload.decode())
        # Expecting: {deviceId, voltage, current, power, energy}
        power = payload.get("power")
        if isinstance(power, (int, float)):
            power_samples.append(power)
    except Exception as e:
        print(f"[PricingAgent] Message parsing error: {e}")

# ---------------------------------------------------
# Pricing algorithm (simple demand‑based adjustment)
# ---------------------------------------------------
def compute_price():
    global current_price
    if not power_samples:
        return current_price
    avg_power = sum(power_samples) / len(power_samples)  # kW
    # Higher demand -> higher price, lower demand -> lower price
    # Adjust within ±30% of base price
    delta = (avg_power - 1.0) * ADJ_FACTOR  # assume 1 kW nominal
    new_price = BASE_PRICE * (1 + delta)
    # Clamp
    new_price = max(BASE_PRICE * 0.7, min(BASE_PRICE * 1.3, new_price))
    current_price = round(new_price, 2)
    return current_price

# ---------------------------------------------------
# Background task that updates price every 15 seconds
# ---------------------------------------------------
async def price_updater():
    while True:
        compute_price()
        await asyncio.sleep(15)

# ---------------------------------------------------
# HTTP endpoint
# ---------------------------------------------------
@app.get("/price")
async def get_price():
    return JSONResponse(content={"price": current_price})

# ---------------------------------------------------
# Main entry point – starts MQTT loop and FastAPI server
# ---------------------------------------------------
def main():
    client = mqtt.Client()
    if MQTT_USER:
        client.username_pw_set(MQTT_USER, MQTT_PASS)
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_start()

    # Start FastAPI via uvicorn in the same event loop
    loop = asyncio.get_event_loop()
    loop.create_task(price_updater())
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    main()
