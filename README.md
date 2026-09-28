# SolarSync - P2P Solar Energy Sharing Platform

**स्वच्छ ऊर्जा, पारदर्शी साझाकरण**

A peer-to-peer solar energy sharing platform enabling landlords with rooftop solar systems to share excess energy with tenants through a transparent, prepaid, IoT-enabled system.

---

## 🏗️ Architecture

```
┌─────────────────┐     MQTT      ┌─────────────────┐     REST API    ┌─────────────────┐
│   ESP32 +       │ ◄──────────► │   Backend       │ ◄────────────► │   Mobile App    │
│   PZEM-004T     │              │   (Node.js)     │                │   (Flutter)     │
│   Smart Meter   │              │   + MQTT Client │                │   Consumer &    │
└─────────────────┘              │                 │                │   Provider UI   │
                                 │   ┌─────────┐   │                └─────────────────┘
                                 │   │PostgreSQL│   │
                                 │   │ + InfluxDB│  │
                                 │   └─────────┘   │
                                 └─────────────────┘
```

## 📁 Project Structure

```
SolarSync/
├── hardware/              # ESP32 firmware
│   └── esp32_mqtt.ino    # Smart meter code
├── backend/               # Node.js server
│   ├── server.js         # Main server with MQTT + REST API
│   ├── package.json      # Dependencies
│   └── .env              # Environment variables
├── database/             # Database schema
│   └── schema.sql        # PostgreSQL tables + views
├── mobile_app/           # Flutter app
│   └── lib/screens/
│       ├── consumer_dashboard.dart
│       └── provider_dashboard.dart
├── src/                  # React web dashboard (MVP demo)
│   ├── App.tsx
│   └── components/
│       ├── OnboardingScreen.tsx
│       ├── ConsumerDashboard.tsx
│       ├── ProviderDashboard.tsx
│       └── WalletScreen.tsx
├── legal/                # Legal documents
└── README.md
```

## 🚀 Quick Start

### 1. Database Setup
```bash
# Create database
createdb solarsync

# Run schema
psql -U postgres -d solarsync -f database/schema.sql
```

### 2. Backend Server
```bash
cd backend
npm install
cp .env.example .env  # Edit with your credentials
npm start
```

### 3. ESP32 Setup
1. Open `hardware/esp32_mqtt.ino` in Arduino IDE
2. Install libraries: `PubSubClient`, `PZEM004Tv30`, `ArduinoJson`
3. Update WiFi credentials and MQTT broker
4. Flash to ESP32

### 4. Mobile App
```bash
cd mobile_app
flutter pub get
flutter run
```

### 5. Web Dashboard (Demo)
```bash
npm install
npm run dev
```

## 🔧 Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| IoT Device | ESP32 + PZEM-004T | Energy metering & relay control |
| Protocol | MQTT | Real-time bidirectional communication |
| Backend | Node.js + Express | REST API + MQTT client |
| Database | PostgreSQL | User data, wallet, transactions |
| Time-Series | InfluxDB | Energy meter readings |
| Mobile | Flutter | Cross-platform app |
| Web | React + Vite + Tailwind | Dashboard & demo |

## 🔑 Key Features

- ✅ **Prepaid Wallet System** - UPI recharge, auto-cutoff at ₹0
- ✅ **Real-Time Tracking** - Per-second consumption monitoring
- ✅ **Dynamic Pricing** - Supply/demand based rate adjustment
- ✅ **Safety Protection** - Over-voltage, over-current auto-cutoff
- ✅ **Dispute-Proof Logs** - NABL-calibrated meter data with timestamps
- ✅ **Remote Control** - Provider can disconnect consumers remotely
- ✅ **Legal Compliance** - Digital consent for Shared Green Energy Agreement

## 📊 MQTT Topics

| Topic | Direction | Description |
|-------|-----------|-------------|
| `solarsync/{device_id}/data` | ESP32 → Server | Energy readings (every 5s) |
| `solarsync/{device_id}/command` | Server → ESP32 | CUTOFF/RESTORE commands |
| `solarsync/{device_id}/status` | ESP32 → Server | Device status updates |
| `solarsync/{device_id}/alert` | ESP32 → Server | Safety alerts |
| `solarsync/broadcast/rate` | Server → All | Rate change notifications |

## 🔒 Security

- JWT-based authentication
- Rate limiting on all API endpoints
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- `.gitignore` excludes all secrets
- HTTPS in production
- Device-level command authentication

## 📈 MVP Success Metrics

1. **Zero Payment Disputes** - 95% reduction in billing disputes
2. **User Retention** - 80%+ active usage after 30 days
3. **System Uptime** - 99% IoT device + server uptime

## 📝 License

MIT License - See LICENSE file for details.

---

**Built with ☀️ for a sustainable future**
