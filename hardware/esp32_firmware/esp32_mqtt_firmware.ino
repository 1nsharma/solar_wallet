// ESP32 Production-Ready Firmware with OTA and MQTT telemetry
// Arduino sketch for ESP32 measuring power using PZEM-004T and publishing to MQTT
// OTA support via ArduinoOTA library

#include <WiFi.h>
#include <ArduinoOTA.h>
#include <PubSubClient.h>
#include "PZEM004Tv30.h"

// ----- WiFi & MQTT configuration -----
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* mqttServer = "YOUR_MQTT_BROKER";
const uint16_t mqttPort = 1883;
const char* mqttUser = "MQTT_USERNAME";
const char* mqttPassword = "MQTT_PASSWORD";

WiFiClient espClient;
PubSubClient client(espClient);
PZEM004Tv30 pzem(Serial2, 16, 17); // RX, TX pins for PZEM on Serial2

// Device identifier (e.g., flat number)
const char* deviceId = "flat-01";

// OTA hostname
const char* otaHostname = "esp32-ota-flat01";

void setupWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print('.');
  }
  Serial.println("\nWiFi connected");
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect(deviceId, mqttUser, mqttPassword)) {
      Serial.println("connected");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5s");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  // Initialize PZEM on Serial2
  Serial2.begin(9600, SERIAL_8N1, 16, 17);
  pzem.resetEnergy();

  setupWiFi();
  client.setServer(mqttServer, mqttPort);

  // ----- OTA Setup -----
  ArduinoOTA.setHostname(otaHostname);
  ArduinoOTA.onStart([]() {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH) type = "sketch";
    else type = "filesystem";
    Serial.println("Start OTA: " + type);
  });
  ArduinoOTA.onEnd([]() { Serial.println("\nEnd"); });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed");
  });
  ArduinoOTA.begin();

  Serial.println("Setup complete");
}

void loop() {
  ArduinoOTA.handle();
  if (!client.connected()) reconnectMQTT();
  client.loop();

  // Read measurements from PZEM
  float voltage = pzem.voltage();
  float current = pzem.current();
  float power = pzem.power();
  float energy = pzem.energy(); // kWh accumulated

  // Build JSON payload
  String payload = "{\"deviceId\":\"" + String(deviceId) + "\",\"voltage\":" + String(voltage, 2) + ",\"current\":" + String(current, 3) + ",\"power\":" + String(power, 2) + ",\"energy\":" + String(energy, 3) + "}";

  // Publish to topic per device
  String topic = String("solar_sync/") + deviceId + "/telemetry";
  client.publish(topic.c_str(), payload.c_str());

  // Publish every 5 seconds
  static unsigned long lastMs = 0;
  if (millis() - lastMs > 5000) {
    Serial.println("Published: " + payload);
    lastMs = millis();
  }
}
