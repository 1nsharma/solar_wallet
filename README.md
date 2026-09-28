# SolarSync

**SolarSync** is a full‑stack microgrid management platform that combines:
- **ESP32 firmware** (OTA‑enabled MQTT telemetry)
- **Pricing Agent** (Python service with dynamic pricing via MQTT + Flask API)
- **Notification Agent** (Node.js server for Firebase Cloud Messaging)
- **React + Vite Admin Dashboard** (landlord/manager UI)
- **Consumer/Provider mobile UI** (already shipped)

## Quick start
```bash
# 1️⃣ Clone the repo
git clone <repo-url>
cd solar_wallet

# 2️⃣ Install Node dependencies
npm install

# 3️⃣ Run the web app (development)
npm run dev

# 4️⃣ Start the Pricing Agent (Python)
cd pricing_agent
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python pricing_agent.py

# 5️⃣ Start the Notification Agent (Node)
cd ../notification_agent
npm install
node notification_agent.js
```

## Architecture
```mermaid
flowchart TD
    subgraph ESP32_Firmware[ESP32 Firmware]
        A[ESP32] -->|MQTT telemetry| B[MQTT Broker]
    end
    subgraph Backend[Backend Services]
        B --> C[Pricing Agent (Python Flask)]
        B --> D[Notification Agent (Node.js FCM)]
    end
    subgraph Frontend[Web Frontend]
        E[React + Vite] -->|API calls| C
        E -->|Push notifications| D
    end
    subgraph Mobile[Mobile Apps]
        F[Consumer UI] -->|MQTT| B
        G[Provider UI] -->|MQTT| B
    end
    A -. OTA .- F
    A -. OTA .- G
    style ESP32_Firmware fill:#1e3a8a,color:#fff,stroke:#3b82f6
    style Backend fill:#065f46,color:#fff,stroke:#10b981
    style Frontend fill:#4c1d95,color:#fff,stroke:#a78bfa
    style Mobile fill:#8b5cf6,color:#fff,stroke:#c084fc
```

## Deployment checklist
- [ ] Create a **Firebase project** and download `serviceAccountKey.json` for the Notification Agent.
- [ ] Set environment variables for MQTT broker (`MQTT_BROKER`, `MQTT_PORT`, `MQTT_TOPIC`).
- [ ] Configure OTA Wi‑Fi credentials in `esp32_mqtt_firmware.ino`.
- [ ] Deploy the React app to a static host (e.g., Firebase Hosting or Vercel).
- [ ] Run the Pricing Agent on a server reachable by the MQTT broker.
- [ ] Verify push notifications work on mobile devices.
- [ ] Enable HTTPS for all API endpoints.

---

**Enjoy your SolarSync system!**
