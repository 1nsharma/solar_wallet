# SolarSync - ESP32 Wiring Diagram
# Hardware: ESP32 DevKit + PZEM-004T V3.0 + 5V Relay Module

## COMPONENTS REQUIRED:
1. ESP32 DevKit V1 (30-pin or 38-pin)
2. PZEM-004T V3.0 (AC Digital Energy Meter)
3. 5V Single Channel Relay Module
4. 5V 2A Power Supply (for ESP32 + Relay)
5. AC Load (Fan/Light/Bulb for testing)
6. Jumper Wires
7. Breadboard or PCB

## WIRING CONNECTIONS:

### PZEM-004T → ESP32
```
PZEM-004T          ESP32
┌──────────┐      ┌──────────┐
│ VCC  ─────────────── 5V (VIN) │
│ GND  ─────────────── GND      │
│ TX   ─────────────── GPIO 16  │ (RX2)
│ RX   ─────────────── GPIO 17  │ (TX2)
└──────────┘      └──────────┘
```

### Relay Module → ESP32
```
Relay Module       ESP32
┌──────────┐      ┌──────────┐
│ VCC  ─────────────── 5V (VIN) │
│ GND  ─────────────── GND      │
│ IN   ─────────────── GPIO 5   │
└──────────┘      └──────────┘
```

### AC Load Connection (Through Relay)
```
AC Mains (220V)
    │
    ├──L (Live) ──→ Relay COM
    │                Relay NO ──→ Load (Fan/Light)
    │                Load ──→ AC Neutral
    │
    └──N (Neutral) ────────────→ Load (Direct)

PZEM-004T:
    │
    ├── AC Input (from Mains, in parallel)
    └── AC Load (in series with the load being measured)
```

### PZEM-004T AC Measurement Connection
```
AC Mains ───→ PZEM-004T AC Input terminals
                    │
                    ├── Measures Voltage (V)
                    ├── Measures Current (A) - via CT clamp
                    ├── Measures Power (W)
                    └── Measures Energy (Wh)

NOTE: PZEM-004T V3.0 has built-in CT (Current Transformer)
      for non-contact current measurement.
```

## SAFETY NOTES:
⚠️  NEVER work on live AC wiring
⚠️  Use proper insulation and enclosures
⚠️  Ensure relay rating matches your load (10A typical)
⚠️  PZEM-004T is rated for max 100A (with external CT)
⚠️  Always use a fuse on the AC input side
⚠️  Keep low voltage (DC) and high voltage (AC) wiring separate

## PIN SUMMARY:
```
GPIO 5  → Relay IN (Output - Controls AC supply)
GPIO 16 → PZEM TX → ESP32 RX2 (Input - Receives data)
GPIO 17 → PZEM RX → ESP32 TX2 (Output - Sends commands)
GPIO 2  → Built-in LED (Status indicator)
```

## POWER REQUIREMENTS:
- ESP32: 5V via USB or VIN pin (3.3V internally)
- PZEM-004T: 5V (from ESP32 VIN or separate supply)
- Relay Module: 5V (from ESP32 VIN or separate supply)
- Total: ~5V 2A power supply recommended

## COMMUNICATION:
- PZEM-004T uses Modbus RTU protocol over Serial2
- Baud Rate: 9600
- Data format: 8N1 (8 data bits, No parity, 1 stop bit)
- Default PZEM address: 0xF8
