#!/bin/bash
# ============================================================
# SolarSync - InfluxDB Setup Script
# ============================================================
# Purpose: Create InfluxDB database and retention policies
# Run: bash database/influxdb_setup.sh
# ============================================================

INFLUX_HOST="${INFLUX_HOST:-localhost}"
INFLUX_PORT="${INFLUX_PORT:-8086}"
DB_NAME="${INFLUX_DB:-solarsync}"

echo "========================================"
echo "  SolarSync InfluxDB Setup"
echo "========================================"
echo "Host: ${INFLUX_HOST}:${INFLUX_PORT}"
echo "Database: ${DB_NAME}"
echo ""

# Create database
echo "📦 Creating database..."
curl -s -XPOST "http://${INFLUX_HOST}:${INFLUX_PORT}/query" \
  --data-urlencode "q=CREATE DATABASE ${DB_NAME}"

# Create retention policies
echo "📋 Creating retention policies..."

# Default: Keep 30 days of data
curl -s -XPOST "http://${INFLUX_HOST}:${INFLUX_PORT}/query" \
  --data-urlencode "q=CREATE RETENTION POLICY \"thirty_days\" ON \"${DB_NAME}\" DURATION 30d REPLICATION 1 DEFAULT"

# Long-term: Keep 1 year for monthly summaries
curl -s -XPOST "http://${INFLUX_HOST}:${INFLUX_PORT}/query" \
  --data-urlencode "q=CREATE RETENTION POLICY \"one_year\" ON \"${DB_NAME}\" DURATION 365d REPLICATION 1"

# Create continuous queries for downsampling
echo "📊 Creating continuous queries..."

# Hourly averages
curl -s -XPOST "http://${INFLUX_HOST}:${INFLUX_PORT}/query" \
  --data-urlencode "q=
    CREATE CONTINUOUS QUERY \"cq_hourly_avg\" ON \"${DB_NAME}\" 
    BEGIN 
      SELECT mean(power) AS mean_power, 
             mean(voltage) AS mean_voltage, 
             mean(current) AS mean_current,
             max(power) AS max_power,
             sum(energy) AS total_energy
      INTO \"energy_hourly\" 
      FROM \"energy_consumption\" 
      GROUP BY time(1h), device_id 
    END"

# Daily summaries
curl -s -XPOST "http://${INFLUX_HOST}:${INFLUX_PORT}/query" \
  --data-urlencode "q=
    CREATE CONTINUOUS QUERY \"cq_daily_summary\" ON \"${DB_NAME}\" 
    BEGIN 
      SELECT mean(power) AS mean_power, 
             max(power) AS peak_power,
             min(power) AS min_power,
             sum(energy) AS daily_energy,
             mean(voltage) AS mean_voltage,
             count(power) AS reading_count
      INTO \"energy_daily\" 
      FROM \"energy_consumption\" 
      GROUP BY time(1d), device_id 
    END"

echo ""
echo "✅ InfluxDB setup complete!"
echo ""
echo "Database: ${DB_NAME}"
echo "Retention Policies:"
echo "  - thirty_days (DEFAULT): 30 days"
echo "  - one_year: 365 days"
echo ""
echo "Continuous Queries:"
echo "  - cq_hourly_avg: Hourly averages"
echo "  - cq_daily_summary: Daily summaries"
echo ""
echo "========================================"
