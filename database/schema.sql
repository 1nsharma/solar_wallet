-- ============================================================
-- SolarSync Database Schema v1.0
-- PostgreSQL 14+
-- ============================================================
-- Purpose: Core relational data for P2P Solar Energy Platform
-- Tables: users, transactions, agreements, events, alerts,
--         support_tickets, pricing_log, device_registry
-- ============================================================

-- Drop existing tables (for development only - comment out in production)
-- DROP TABLE IF EXISTS support_tickets CASCADE;
-- DROP TABLE IF EXISTS alerts CASCADE;
-- DROP TABLE IF EXISTS events CASCADE;
-- DROP TABLE IF EXISTS transactions CASCADE;
-- DROP TABLE IF EXISTS agreements CASCADE;
-- DROP TABLE IF EXISTS pricing_log CASCADE;
-- DROP TABLE IF EXISTS device_registry CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- ============================================================
-- TABLE: users
-- Stores all platform users (providers and consumers)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    user_id         SERIAL PRIMARY KEY,
    device_id       VARCHAR(50) UNIQUE,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    phone           VARCHAR(15),
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('provider', 'consumer', 'admin')),
    wallet_balance  DECIMAL(12, 2) DEFAULT 0.00 CHECK (wallet_balance >= 0),
    security_deposit DECIMAL(10, 2) DEFAULT 2000.00,
    
    -- Device status tracking
    device_status   VARCHAR(20) DEFAULT 'offline' CHECK (device_status IN ('online', 'offline', 'error', 'maintenance')),
    relay_state     BOOLEAN DEFAULT true,
    wifi_rssi       INTEGER DEFAULT 0,
    last_seen       TIMESTAMP,
    last_updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Metadata
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active       BOOLEAN DEFAULT true,
    
    -- Constraints
    CONSTRAINT valid_phone CHECK (phone ~ '^[0-9]{10,15}$' OR phone IS NULL)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_users_device_id ON users(device_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen);

-- ============================================================
-- TABLE: transactions
-- Records all financial transactions (consumption, recharge, refund)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id   SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    energy_kwh       DECIMAL(10, 4) NOT NULL DEFAULT 0,
    rate_per_unit    DECIMAL(6, 2) NOT NULL DEFAULT 0,
    cost             DECIMAL(10, 2) NOT NULL DEFAULT 0,
    balance_after    DECIMAL(12, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('consumption', 'recharge', 'refund', 'adjustment', 'penalty')),
    payment_method   VARCHAR(20) DEFAULT NULL CHECK (payment_method IN ('upi', 'card', 'netbanking', 'wallet', NULL)),
    payment_ref      VARCHAR(100) DEFAULT NULL,
    description      TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- For dispute resolution
    is_disputed      BOOLEAN DEFAULT false,
    dispute_notes    TEXT
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, created_at DESC);

-- ============================================================
-- TABLE: agreements
-- Records legal consent for Shared Green Energy Infrastructure Agreement
-- ============================================================
CREATE TABLE IF NOT EXISTS agreements (
    agreement_id     SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    agreement_version VARCHAR(10) NOT NULL DEFAULT '1.0',
    agreement_type   VARCHAR(50) DEFAULT 'shared_green_energy_infrastructure',
    accepted_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address       VARCHAR(45),
    user_agent       TEXT,
    digital_signature VARCHAR(255),
    is_active        BOOLEAN DEFAULT true,
    
    -- Track if user accepted updates
    superseded_by    INTEGER REFERENCES agreements(agreement_id),
    
    CONSTRAINT unique_active_agreement UNIQUE (user_id, agreement_version)
);

CREATE INDEX IF NOT EXISTS idx_agreements_user ON agreements(user_id);
CREATE INDEX IF NOT EXISTS idx_agreements_version ON agreements(agreement_version);

-- ============================================================
-- TABLE: events
-- System events log (cutoffs, restores, errors, maintenance)
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
    event_id         SERIAL PRIMARY KEY,
    device_id        VARCHAR(50) NOT NULL,
    event_type       VARCHAR(50) NOT NULL CHECK (event_type IN (
        'cutoff', 'restore', 'remote_disconnect', 'remote_restore',
        'safety_trip', 'reconnect', 'firmware_update', 'maintenance',
        'rate_change', 'error', 'warning'
    )),
    description      TEXT NOT NULL,
    triggered_by     INTEGER REFERENCES users(user_id),  -- NULL if system-triggered
    metadata         JSONB DEFAULT '{}',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_events_device ON events(device_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);

-- ============================================================
-- TABLE: alerts
-- Device and system alerts (from ESP32 safety checks)
-- ============================================================
CREATE TABLE IF NOT EXISTS alerts (
    alert_id         SERIAL PRIMARY KEY,
    device_id        VARCHAR(50) NOT NULL,
    severity         VARCHAR(20) NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    message          TEXT NOT NULL,
    resolved         BOOLEAN DEFAULT false,
    resolved_at      TIMESTAMP,
    resolved_by      INTEGER REFERENCES users(user_id),
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_device ON alerts(device_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_unresolved ON alerts(resolved) WHERE resolved = false;
CREATE INDEX IF NOT EXISTS idx_alerts_created ON alerts(created_at DESC);

-- ============================================================
-- TABLE: support_tickets
-- Dispute and support ticket management
-- ============================================================
CREATE TABLE IF NOT EXISTS support_tickets (
    ticket_id        SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    device_id        VARCHAR(50) NOT NULL,
    issue_type       VARCHAR(50) NOT NULL CHECK (issue_type IN (
        'billing_dispute', 'meter_accuracy', 'supply_interruption',
        'rate_complaint', 'technical_issue', 'agreement_query', 'other'
    )),
    description      TEXT NOT NULL,
    status           VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed', 'escalated')),
    priority         VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    data_context     JSONB,  -- Snapshot of relevant data at time of ticket
    assigned_to      INTEGER REFERENCES users(user_id),
    resolution_notes TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at      TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_device ON support_tickets(device_id);

-- ============================================================
-- TABLE: pricing_log
-- History of dynamic pricing changes
-- ============================================================
CREATE TABLE IF NOT EXISTS pricing_log (
    log_id           SERIAL PRIMARY KEY,
    old_rate         DECIMAL(6, 2) NOT NULL,
    new_rate         DECIMAL(6, 2) NOT NULL,
    reason           TEXT,
    solar_production DECIMAL(10, 2),  -- Watts at time of change
    total_demand     DECIMAL(10, 2),  -- Watts at time of change
    changed_by       INTEGER REFERENCES users(user_id),  -- NULL if auto
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_pricing_created ON pricing_log(created_at DESC);

-- ============================================================
-- TABLE: device_registry
-- Tracks all registered IoT devices
-- ============================================================
CREATE TABLE IF NOT EXISTS device_registry (
    registry_id      SERIAL PRIMARY KEY,
    device_id        VARCHAR(50) UNIQUE NOT NULL,
    device_type      VARCHAR(30) NOT NULL CHECK (device_type IN ('smart_meter', 'solar_inverter', 'relay_module', 'gateway')),
    firmware_version VARCHAR(20),
    hardware_version VARCHAR(20),
    mac_address      VARCHAR(17),
    calibration_date DATE,
    calibration_cert_url TEXT,
    installation_date DATE,
    last_firmware_update TIMESTAMP,
    status           VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance', 'decommissioned')),
    metadata         JSONB DEFAULT '{}',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_device_registry_id ON device_registry(device_id);
CREATE INDEX IF NOT EXISTS idx_device_registry_type ON device_registry(device_type);

-- ============================================================
-- TABLE: provider_consumer_mapping
-- Maps which consumers are connected to which provider
-- ============================================================
CREATE TABLE IF NOT EXISTS provider_consumer_mapping (
    mapping_id       SERIAL PRIMARY KEY,
    provider_id      INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    consumer_id      INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    is_active        BOOLEAN DEFAULT true,
    start_date       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_date         TIMESTAMP,
    agreed_rate      DECIMAL(6, 2),
    
    CONSTRAINT unique_mapping UNIQUE (provider_id, consumer_id),
    CONSTRAINT no_self_mapping CHECK (provider_id != consumer_id)
);

CREATE INDEX IF NOT EXISTS idx_mapping_provider ON provider_consumer_mapping(provider_id);
CREATE INDEX IF NOT EXISTS idx_mapping_consumer ON provider_consumer_mapping(consumer_id);

-- ============================================================
-- TABLE: daily_summaries
-- Pre-computed daily summaries for fast dashboard loading
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_summaries (
    summary_id       SERIAL PRIMARY KEY,
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    summary_date     DATE NOT NULL,
    total_energy_kwh DECIMAL(10, 4) DEFAULT 0,
    total_cost       DECIMAL(10, 2) DEFAULT 0,
    avg_rate         DECIMAL(6, 2) DEFAULT 0,
    peak_power_watts DECIMAL(10, 2) DEFAULT 0,
    min_power_watts  DECIMAL(10, 2) DEFAULT 0,
    uptime_minutes   INTEGER DEFAULT 1440,
    transaction_count INTEGER DEFAULT 0,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_daily_summary UNIQUE (user_id, summary_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_user_date ON daily_summaries(user_id, summary_date DESC);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_device_registry_updated_at BEFORE UPDATE ON device_registry
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SAMPLE DATA (Development/Testing)
-- ============================================================

-- Provider (Building Owner)
INSERT INTO users (device_id, name, email, phone, password_hash, role, wallet_balance, security_deposit)
VALUES (
    'solar_main',
    'सूरज गुप्ता (Building Owner)',
    'surya@example.com',
    '9876543200',
    '$2a$10$dummyhashfordevelopment000000000000000000000000',
    'provider',
    0.00,
    0.00
) ON CONFLICT (email) DO NOTHING;

-- Consumer 1
INSERT INTO users (device_id, name, email, phone, password_hash, role, wallet_balance, security_deposit)
VALUES (
    'flat_101',
    'राहुल शर्मा',
    'rahul@example.com',
    '9876543210',
    '$2a$10$dummyhashfordevelopment000000000000000000000000',
    'consumer',
    500.00,
    2000.00
) ON CONFLICT (email) DO NOTHING;

-- Consumer 2
INSERT INTO users (device_id, name, email, phone, password_hash, role, wallet_balance, security_deposit)
VALUES (
    'flat_102',
    'प्रिया सिंह',
    'priya@example.com',
    '9876543211',
    '$2a$10$dummyhashfordevelopment000000000000000000000000',
    'consumer',
    345.50,
    2000.00
) ON CONFLICT (email) DO NOTHING;

-- Consumer 3
INSERT INTO users (device_id, name, email, phone, password_hash, role, wallet_balance, security_deposit)
VALUES (
    'flat_201',
    'अमित वर्मा',
    'amit@example.com',
    '9876543212',
    '$2a$10$dummyhashfordevelopment000000000000000000000000',
    'consumer',
    278.00,
    2000.00
) ON CONFLICT (email) DO NOTHING;

-- Register devices
INSERT INTO device_registry (device_id, device_type, firmware_version, hardware_version, calibration_date, status)
VALUES 
    ('solar_main', 'solar_inverter', '1.0.0', 'HW-REV2', '2025-01-15', 'active'),
    ('flat_101', 'smart_meter', '1.0.0', 'HW-REV1', '2025-01-15', 'active'),
    ('flat_102', 'smart_meter', '1.0.0', 'HW-REV1', '2025-01-15', 'active'),
    ('flat_201', 'smart_meter', '1.0.0', 'HW-REV1', '2025-01-15', 'active')
ON CONFLICT (device_id) DO NOTHING;

-- Map consumers to provider
INSERT INTO provider_consumer_mapping (provider_id, consumer_id, agreed_rate)
SELECT 
    (SELECT user_id FROM users WHERE device_id = 'solar_main'),
    u.user_id,
    6.50
FROM users u
WHERE u.device_id IN ('flat_101', 'flat_102', 'flat_201')
ON CONFLICT DO NOTHING;

-- ============================================================
-- VIEWS (For common queries)
-- ============================================================

-- Active consumers with live data
CREATE OR REPLACE VIEW vw_active_consumers AS
SELECT 
    u.user_id,
    u.device_id,
    u.name,
    u.wallet_balance,
    u.device_status,
    u.relay_state,
    u.last_seen,
    pcm.provider_id,
    pcm.agreed_rate
FROM users u
JOIN provider_consumer_mapping pcm ON u.user_id = pcm.consumer_id
WHERE pcm.is_active = true AND u.is_active = true;

-- Today's provider earnings
CREATE OR REPLACE VIEW vw_provider_daily_earnings AS
SELECT 
    pcm.provider_id,
    SUM(t.cost) as total_earnings,
    SUM(t.energy_kwh) as total_units,
    COUNT(DISTINCT t.user_id) as active_consumers
FROM transactions t
JOIN users u ON t.user_id = u.user_id
JOIN provider_consumer_mapping pcm ON u.user_id = pcm.consumer_id
WHERE t.transaction_type = 'consumption'
  AND t.created_at >= CURRENT_DATE
  AND pcm.is_active = true
GROUP BY pcm.provider_id;

-- ============================================================
-- GRANT PERMISSIONS (Adjust as needed)
-- ============================================================
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO solarsync_app;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO solarsync_app;

-- ============================================================
-- SCHEMA COMPLETE
-- ============================================================
-- Run this file with:
--   psql -U postgres -d solarsync -f database/schema.sql
-- ============================================================
