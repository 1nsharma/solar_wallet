/*
 * ============================================================
 * SolarSync - ESP32 Smart Meter Code
 * ============================================================
 * Hardware: ESP32 + PZEM-004T (V3.0) + 5V Relay Module
 * Function: 
 *   - Reads voltage, current, power, energy from PZEM-004T
 *   - Sends data via MQTT to backend server every 5 seconds
 *   - Receives cutoff/restore commands from server
 *   - Implements OTA-safe reconnection logic
 *   - Stores last readings in EEPROM for power-loss recovery
 * ============================================================
 * Wiring Diagram:
 *   PZEM-004T TX  -> ESP32 GPIO 16 (RX2)
 *   PZEM-004T RX  -> ESP32 GPIO 17 (TX2)
 *   PZEM-004T VCC -> 5V (ESP32 Vin)
 *   PZEM-004T GND -> GND
 *   Relay IN       -> ESP32 GPIO 5
 *   Relay VCC      -> 5V
 *   Relay GND      -> GND
 * ============================================================
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <PZEM004Tv30.h>
#include <ArduinoJson.h>
#include <Preferences.h>

// ==================== USER CONFIGURATION ====================
// WiFi Credentials (Change these)
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker Configuration
const char* mqtt_server = "broker.hivemq.com";
const int mqtt_port = 1883;
const char* mqtt_user = "";  // Empty for public broker
const char* mqtt_pass = "";

// Device Identity (Unique per flat/tenant)
const char* device_id = "flat_101";
const char* device_location = "Building A, Flat 101";

// ==================== PIN DEFINITIONS ====================
#define RELAY_PIN       5      // GPIO 5 - Relay control
#define STATUS_LED      2      // GPIO 2 - Built-in LED for status
#define PZEM_RX_PIN     16     // GPIO 16 - PZEM Serial RX
#define PZEM_TX_PIN     17     // GPIO 17 - PZEM Serial TX

// ==================== TIMING CONSTANTS ====================
#define MQTT_SEND_INTERVAL    5000   // Send data every 5 seconds
#define WIFI_RETRY_INTERVAL   10000  // Retry WiFi every 10 seconds
#define MQTT_RETRY_INTERVAL   5000   // Retry MQTT every 5 seconds
#define LED_BLINK_INTERVAL    1000   // LED blink interval

// ==================== SAFETY THRESHOLDS ====================
#define MAX_VOLTAGE     270.0   // Over-voltage cutoff (V)
#define MIN_VOLTAGE     160.0   // Under-voltage cutoff (V)
#define MAX_CURRENT     30.0    // Over-current cutoff (A)
#define MAX_POWER       5000.0  // Max power limit (W)

// ==================== GLOBAL OBJECTS ====================
PZEM004Tv30 pzem(Serial2, PZEM_RX_PIN, PZEM_TX_PIN);
WiFiClient espClient;
PubSubClient mqttClient(espClient);
Preferences preferences;

// ==================== MQTT TOPICS ====================
char topic_data[64];
char topic_command[64];
char topic_status[64];
char topic_alert[64];

// ==================== STATE VARIABLES ====================
bool relayState = true;          // true = ON, false = OFF
bool serverOverride = false;     // true = server forced cutoff
unsigned long lastSendTime = 0;
unsigned long lastWifiCheck = 0;
unsigned long lastLedBlink = 0;
int mqttReconnectAttempts = 0;
float totalEnergyKwh = 0.0;     // Accumulated energy

// ==================== FUNCTION DECLARATIONS ====================
void setupWiFi();
void setupMQTT();
void mqttCallback(char* topic, byte* payload, unsigned int length);
void reconnectMQTT();
void readAndPublishData();
void handleCommand(String command);
void setRelayState(bool state, String reason);
void checkSafetyThresholds(float voltage, float current, float power);
void blinkLED(int times, int interval);
void publishStatus(String status, String message);
void publishAlert(String severity, String message);
String buildJsonPayload(float voltage, float current, float power, float energy);

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n========================================");
  Serial.println("  SolarSync Smart Meter v1.0");
  Serial.println("  Device ID: " + String(device_id));
  Serial.println("  Location: " + String(device_location));
  Serial.println("========================================\n");

  // Initialize Preferences (EEPROM replacement)
  preferences.begin("solarsync", false);
  relayState = preferences.getBool("relayState", true);
  totalEnergyKwh = preferences.getFloat("totalEnergy", 0.0);

  // Initialize Pins
  pinMode(RELAY_PIN, OUTPUT);
  pinMode(STATUS_LED, OUTPUT);
  digitalWrite(RELAY_PIN, relayState ? HIGH : LOW);
  digitalWrite(STATUS_LED, LOW);

  Serial.println("Relay state restored: " + String(relayState ? "ON" : "OFF"));
  Serial.println("Accumulated energy: " + String(totalEnergyKwh, 3) + " kWh");

  // Initialize PZEM Sensor
  Serial2.begin(9600, SERIAL_8N1, PZEM_RX_PIN, PZEM_TX_PIN);
  delay(500);
  
  // Set PZEM address (default 0xF8)
  if (!pzem.readAddress()) {
    Serial.println("PZEM not detected! Check wiring.");
    blinkLED(5, 100);
  } else {
    Serial.println("PZEM-004T detected successfully");
  }

  // Setup MQTT Topics
  snprintf(topic_data, sizeof(topic_data), "solarsync/%s/data", device_id);
  snprintf(topic_command, sizeof(topic_command), "solarsync/%s/command", device_id);
  snprintf(topic_status, sizeof(topic_status), "solarsync/%s/status", device_id);
  snprintf(topic_alert, sizeof(topic_alert), "solarsync/%s/alert", device_id);

  // Connect to WiFi
  setupWiFi();

  // Connect to MQTT
  setupMQTT();

  // Publish online status
  publishStatus("online", "Device booted successfully");
  blinkLED(2, 200);
}

// ==================== MAIN LOOP ====================
void loop() {
  unsigned long currentMillis = millis();

  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    if (currentMillis - lastWifiCheck > WIFI_RETRY_INTERVAL) {
      Serial.println("WiFi disconnected. Reconnecting...");
      setupWiFi();
      lastWifiCheck = currentMillis;
    }
  }

  // Check MQTT connection
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // Send data at regular intervals
  if (currentMillis - lastSendTime > MQTT_SEND_INTERVAL) {
    readAndPublishData();
    lastSendTime = currentMillis;
  }

  // Status LED heartbeat
  if (currentMillis - lastLedBlink > LED_BLINK_INTERVAL) {
    digitalWrite(STATUS_LED, !digitalRead(STATUS_LED));
    lastLedBlink = currentMillis;
  }
}

// ==================== WIFI SETUP ====================
void setupWiFi() {
  Serial.print("Connecting to WiFi: ");
  Serial.println(ssid);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500);
    Serial.print(".");
    blinkLED(1, 50);
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm");
  } else {
    Serial.println("\nWiFi Connection Failed! Will retry...");
  }
}

// ==================== MQTT SETUP ====================
void setupMQTT() {
  mqttClient.setServer(mqtt_server, mqtt_port);
  mqttClient.setCallback(mqttCallback);
  mqttClient.setBufferSize(512);
  mqttClient.setKeepAlive(60);
}

// ==================== MQTT RECONNECTION ====================
void reconnectMQTT() {
  while (!mqttClient.connected() && mqttReconnectAttempts < 10) {
    Serial.print("Connecting to MQTT Broker...");
    
    String clientId = "solarsync_" + String(device_id) + "_" + String(millis());
    
    // Set Last Will and Testament (LWT)
    String willMessage = "{\"device_id\":\"" + String(device_id) + "\",\"status\":\"offline\"}";
    
    if (mqttClient.connect(
          clientId.c_str(), 
          mqtt_user, 
          mqtt_pass,
          topic_status,  // will topic
          1,             // will QoS
          false,         // will retain
          willMessage.c_str()  // will message
        )) {
      
      Serial.println("Connected to MQTT!");
      mqttReconnectAttempts = 0;
      
      // Subscribe to command topic
      if (mqttClient.subscribe(topic_command)) {
        Serial.print("Subscribed to: ");
        Serial.println(topic_command);
      }
      
      // Publish online status
      publishStatus("online", "MQTT reconnected");
      
    } else {
      Serial.print("Failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" Retrying in 5s...");
      mqttReconnectAttempts++;
      delay(MQTT_RETRY_INTERVAL);
    }
  }
  
  if (mqttReconnectAttempts >= 10) {
    Serial.println("Max MQTT reconnect attempts reached. Restarting WiFi...");
    mqttReconnectAttempts = 0;
    WiFi.disconnect();
    delay(1000);
    setupWiFi();
  }
}

// ==================== MQTT CALLBACK ====================
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.println("\n--- MQTT Message Received ---");
  Serial.print("Topic: ");
  Serial.println(topic);
  Serial.print("Payload: ");
  Serial.println(message);
  
  // Parse JSON command
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, message);
  
  if (error) {
    // Fallback to simple string commands
    handleCommand(message);
    return;
  }
  
  const char* cmd = doc["command"];
  if (cmd) {
    handleCommand(String(cmd));
  }
}

// ==================== COMMAND HANDLER ====================
void handleCommand(String command) {
  command.trim();
  command.toUpperCase();
  
  Serial.println("Processing command: " + command);
  
  if (command == "CUTOFF" || command == "OFF") {
    serverOverride = true;
    setRelayState(false, "Server command: CUTOFF");
    publishStatus("cutoff", "Supply cut by server");
  } 
  else if (command == "ON" || command == "RESTORE") {
    serverOverride = false;
    setRelayState(true, "Server command: RESTORE");
    publishStatus("restored", "Supply restored by server");
  }
  else if (command == "STATUS") {
    // Report current status
    StaticJsonDocument<256> statusDoc;
    statusDoc["device_id"] = device_id;
    statusDoc["relay_state"] = relayState;
    statusDoc["server_override"] = serverOverride;
    statusDoc["uptime_seconds"] = millis() / 1000;
    statusDoc["wifi_rssi"] = WiFi.RSSI();
    statusDoc["total_energy_kwh"] = totalEnergyKwh;
    
    char buffer[256];
    serializeJson(statusDoc, buffer);
    mqttClient.publish(topic_status, buffer);
  }
  else if (command == "RESET_ENERGY") {
    totalEnergyKwh = 0.0;
    preferences.putFloat("totalEnergy", 0.0);
    Serial.println("Energy counter reset");
    publishStatus("reset", "Energy counter reset by server");
  }
  else if (command == "REBOOT") {
    publishStatus("rebooting", "Device rebooting...");
    delay(1000);
    ESP.restart();
  }
  else {
    Serial.println("Unknown command: " + command);
    publishAlert("warning", "Unknown command received: " + command);
  }
}

// ==================== RELAY CONTROL ====================
void setRelayState(bool state, String reason) {
  relayState = state;
  digitalWrite(RELAY_PIN, state ? HIGH : LOW);
  
  // Persist state
  preferences.putBool("relayState", state);
  
  Serial.println("Relay " + String(state ? "ON" : "OFF") + " - Reason: " + reason);
  
  // Visual feedback
  if (!state) {
    blinkLED(3, 100);  // 3 fast blinks for cutoff
  } else {
    blinkLED(1, 500);  // 1 slow blink for restore
  }
}

// ==================== READ AND PUBLISH DATA ====================
void readAndPublishData() {
  // Read PZEM sensor values
  float voltage = pzem.voltage();
  float current = pzem.current();
  float power = pzem.power();
  float energy = pzem.energy();
  float frequency = pzem.frequency();
  float pf = pzem.pf();
  
  // Validate readings
  if (isnan(voltage) || voltage < 50) {
    Serial.println("PZEM reading invalid - sensor may be disconnected");
    publishAlert("error", "PZEM sensor not responding");
    return;
  }
  
  // Accumulate energy (if not already tracked by PZEM)
  if (power > 0) {
    float energyIncrement = (power / 1000.0) * (MQTT_SEND_INTERVAL / 3600000.0);
    totalEnergyKwh += energyIncrement;
    preferences.putFloat("totalEnergy", totalEnergyKwh);
  }
  
  // Safety checks
  checkSafetyThresholds(voltage, current, power);
  
  // Build and publish JSON payload
  String payload = buildJsonPayload(voltage, current, power, energy);
  
  if (mqttClient.publish(topic_data, payload.c_str())) {
    Serial.println("Data published: " + payload);
  } else {
    Serial.println("Failed to publish data");
    publishAlert("warning", "MQTT publish failed");
  }
}

// ==================== BUILD JSON PAYLOAD ====================
String buildJsonPayload(float voltage, float current, float power, float energy) {
  StaticJsonDocument<512> doc;
  
  doc["device_id"] = device_id;
  doc["location"] = device_location;
  doc["timestamp"] = millis() / 1000;
  doc["uptime"] = millis();
  
  // Electrical readings
  JsonObject readings = doc.createNestedObject("readings");
  readings["voltage"] = round(voltage * 100.0) / 100.0;
  readings["current"] = round(current * 1000.0) / 1000.0;
  readings["power"] = round(power * 100.0) / 100.0;
  readings["energy"] = round(energy * 1000.0) / 1000.0;
  readings["frequency"] = round(frequency * 100.0) / 100.0;
  readings["power_factor"] = round(pf * 100.0) / 100.0;
  
  // Device status
  doc["relay_state"] = relayState;
  doc["server_override"] = serverOverride;
  doc["total_energy_kwh"] = round(totalEnergyKwh * 1000.0) / 1000.0;
  
  // Network info
  doc["wifi_rssi"] = WiFi.RSSI();
  doc["ip_address"] = WiFi.localIP().toString();
  
  char buffer[512];
  serializeJson(doc, buffer);
  return String(buffer);
}

// ==================== SAFETY CHECKS ====================
void checkSafetyThresholds(float voltage, float current, float power) {
  // Over-voltage protection
  if (voltage > MAX_VOLTAGE) {
    setRelayState(false, "SAFETY: Over-voltage detected (" + String(voltage) + "V)");
    publishAlert("critical", "Over-voltage: " + String(voltage) + "V - Relay cutoff");
    return;
  }
  
  // Under-voltage protection
  if (voltage < MIN_VOLTAGE && voltage > 50) {
    setRelayState(false, "SAFETY: Under-voltage detected (" + String(voltage) + "V)");
    publishAlert("critical", "Under-voltage: " + String(voltage) + "V - Relay cutoff");
    return;
  }
  
  // Over-current protection
  if (current > MAX_CURRENT) {
    setRelayState(false, "SAFETY: Over-current detected (" + String(current) + "A)");
    publishAlert("critical", "Over-current: " + String(current) + "A - Relay cutoff");
    return;
  }
  
  // Over-power protection
  if (power > MAX_POWER) {
    setRelayState(false, "SAFETY: Over-power detected (" + String(power) + "W)");
    publishAlert("critical", "Over-power: " + String(power) + "W - Relay cutoff");
    return;
  }
}

// ==================== PUBLISH STATUS ====================
void publishStatus(String status, String message) {
  StaticJsonDocument<256> doc;
  doc["device_id"] = device_id;
  doc["status"] = status;
  doc["message"] = message;
  doc["timestamp"] = millis() / 1000;
  doc["relay_state"] = relayState;
  
  char buffer[256];
  serializeJson(doc, buffer);
  mqttClient.publish(topic_status, buffer, true);  // Retained message
}

// ==================== PUBLISH ALERT ====================
void publishAlert(String severity, String message) {
  StaticJsonDocument<256> doc;
  doc["device_id"] = device_id;
  doc["severity"] = severity;  // info, warning, error, critical
  doc["message"] = message;
  doc["timestamp"] = millis() / 1000;
  
  char buffer[256];
  serializeJson(doc, buffer);
  mqttClient.publish(topic_alert, buffer);
  
  Serial.println("ALERT [" + severity + "]: " + message);
}

// ==================== LED HELPER ====================
void blinkLED(int times, int interval) {
  for (int i = 0; i < times; i++) {
    digitalWrite(STATUS_LED, HIGH);
    delay(interval);
    digitalWrite(STATUS_LED, LOW);
    delay(interval);
  }
}
