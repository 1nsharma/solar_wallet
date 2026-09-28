/*
 * ============================================================
 * SolarSync Backend Server v1.0
 * ============================================================
 * Architecture:
 *   - Express.js REST API for mobile app communication
 *   - MQTT client for real-time IoT device communication
 *   - PostgreSQL for user data, wallet, transactions
 *   - InfluxDB for time-series energy meter data
 *   - JWT-based authentication
 *   - Dynamic pricing engine
 * ============================================================
 */

require('dotenv').config();
const express = require('express');
const mqtt = require('mqtt');
const { Pool } = require('pg');
const Influx = require('influx');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const morgan = require('morgan');

const app = express();

// ==================== MIDDLEWARE ====================
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// ==================== DATABASE CONNECTIONS ====================

// PostgreSQL Pool
const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT) || 5432,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test PostgreSQL connection
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL error:', err);
});

// InfluxDB Client
const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST || 'localhost',
  port: parseInt(process.env.INFLUX_PORT) || 8086,
  database: process.env.INFLUX_DB || 'solarsync',
  username: process.env.INFLUX_USERNAME || '',
  password: process.env.INFLUX_PASSWORD || '',
  schema: [
    {
      measurement: 'energy_consumption',
      fields: {
        voltage: Influx.FieldType.FLOAT,
        current: Influx.FieldType.FLOAT,
        power: Influx.FieldType.FLOAT,
        energy: Influx.FieldType.FLOAT,
        frequency: Influx.FieldType.FLOAT,
        power_factor: Influx.FieldType.FLOAT,
      },
      tags: ['device_id', 'location'],
    },
    {
      measurement: 'solar_production',
      fields: {
        voltage: Influx.FieldType.FLOAT,
        current: Influx.FieldType.FLOAT,
        power: Influx.FieldType.FLOAT,
        energy: Influx.FieldType.FLOAT,
      },
      tags: ['device_id'],
    },
  ],
});

// ==================== MQTT CLIENT ====================
const mqttClient = mqtt.connect(process.env.MQTT_BROKER, {
  username: process.env.MQTT_USERNAME || '',
  password: process.env.MQTT_PASSWORD || '',
  clientId: 'solarsync_server_' + Date.now(),
  clean: true,
  reconnectPeriod: 5000,
  keepalive: 60,
});

// ==================== DYNAMIC PRICING ENGINE ====================
class PricingEngine {
  constructor() {
    this.currentRate = parseFloat(process.env.DEFAULT_RATE_PER_UNIT) || 6.50;
    this.minRate = parseFloat(process.env.MIN_RATE_PER_UNIT) || 5.00;
    this.maxRate = parseFloat(process.env.MAX_RATE_PER_UNIT) || 10.00;
    this.rateHistory = [];
    this.lastChangeTime = Date.now();
  }

  // Calculate dynamic rate based on supply/demand
  calculateRate(solarProduction, totalDemand, timeOfDay) {
    const supplyDemandRatio = solarProduction / Math.max(totalDemand, 1);
    
    let newRate;
    
    if (supplyDemandRatio > 1.5) {
      // Excess supply - lower price
      newRate = this.minRate + (this.maxRate - this.minRate) * 0.1;
    } else if (supplyDemandRatio > 1.0) {
      // Adequate supply
      newRate = this.minRate + (this.maxRate - this.minRate) * 0.3;
    } else if (supplyDemandRatio > 0.7) {
      // Moderate demand
      newRate = this.minRate + (this.maxRate - this.minRate) * 0.5;
    } else if (supplyDemandRatio > 0.4) {
      // High demand
      newRate = this.minRate + (this.maxRate - this.minRate) * 0.7;
    } else {
      // Critical demand
      newRate = this.maxRate;
    }

    // Time-of-day adjustment
    const hour = new Date().getHours();
    if (hour >= 6 && hour <= 10) {
      newRate *= 0.9; // Morning discount
    } else if (hour >= 18 && hour <= 22) {
      newRate *= 1.2; // Evening peak
    }

    // Clamp to limits
    newRate = Math.max(this.minRate, Math.min(this.maxRate, newRate));
    
    return Math.round(newRate * 100) / 100;
  }

  // Update rate and notify consumers
  async updateRate(newRate) {
    const oldRate = this.currentRate;
    this.currentRate = newRate;
    this.lastChangeTime = Date.now();
    
    this.rateHistory.push({
      rate: newRate,
      timestamp: Date.now(),
      previousRate: oldRate,
    });

    // Keep only last 100 entries
    if (this.rateHistory.length > 100) {
      this.rateHistory.shift();
    }

    // Notify all connected consumers about upcoming rate change
    const noticeMinutes = parseInt(process.env.PRICE_CHANGE_NOTICE_MINUTES) || 15;
    const notification = JSON.stringify({
      type: 'rate_change',
      oldRate: oldRate,
      newRate: newRate,
      effectiveIn: noticeMinutes * 60,
      timestamp: Date.now(),
    });

    mqttClient.publish('solarsync/broadcast/rate', notification);
    console.log(`Rate changed: ₹${oldRate} → ₹${newRate}/unit`);
  }

  getCurrentRate() {
    return this.currentRate;
  }
}

const pricingEngine = new PricingEngine();

// ==================== MQTT EVENT HANDLERS ====================

mqttClient.on('connect', () => {
  console.log('✅ Connected to MQTT Broker');
  
  // Subscribe to all device data topics
  mqttClient.subscribe('solarsync/+/data', (err) => {
    if (!err) console.log('📡 Subscribed to solarsync/+/data');
  });
  
  // Subscribe to device status topics
  mqttClient.subscribe('solarsync/+/status', (err) => {
    if (!err) console.log('📡 Subscribed to solarsync/+/status');
  });
  
  // Subscribe to device alerts
  mqttClient.subscribe('solarsync/+/alert', (err) => {
    if (!err) console.log('📡 Subscribed to solarsync/+/alert');
  });
});

mqttClient.on('error', (err) => {
  console.error('❌ MQTT Error:', err.message);
});

mqttClient.on('reconnect', () => {
  console.log('🔄 Reconnecting to MQTT Broker...');
});

// ==================== MQTT MESSAGE HANDLER ====================
mqttClient.on('message', async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    const topicParts = topic.split('/');
    const deviceId = topicParts[1];
    const messageType = topicParts[2];

    switch (messageType) {
      case 'data':
        await handleEnergyData(deviceId, data);
        break;
      case 'status':
        await handleDeviceStatus(deviceId, data);
        break;
      case 'alert':
        await handleDeviceAlert(deviceId, data);
        break;
      default:
        console.log(`Unknown message type: ${messageType}`);
    }
  } catch (error) {
    console.error('Error processing MQTT message:', error);
  }
});

// ==================== DATA PROCESSING FUNCTIONS ====================

async function handleEnergyData(deviceId, data) {
  try {
    // 1. Store time-series data in InfluxDB
    const readings = data.readings || {};
    
    await influx.writePoints([
      {
        measurement: 'energy_consumption',
        tags: { 
          device_id: deviceId,
          location: data.location || 'unknown'
        },
        fields: {
          voltage: readings.voltage || 0,
          current: readings.current || 0,
          power: readings.power || 0,
          energy: readings.energy || 0,
          frequency: readings.frequency || 50,
          power_factor: readings.power_factor || 0,
        },
      },
    ]);

    // 2. Get user info from PostgreSQL
    const userResult = await pool.query(
      'SELECT user_id, wallet_balance, role FROM users WHERE device_id = $1',
      [deviceId]
    );

    if (userResult.rows.length === 0) {
      console.log(`No user found for device: ${deviceId}`);
      return;
    }

    const user = userResult.rows[0];

    // 3. Calculate cost for this interval
    const ratePerUnit = pricingEngine.getCurrentRate();
    const powerWatts = readings.power || 0;
    const intervalHours = 5 / 3600; // 5 seconds in hours
    const energyKwh = (powerWatts / 1000) * intervalHours;
    const cost = energyKwh * ratePerUnit;

    // 4. Update wallet balance
    const newBalance = Math.max(0, user.wallet_balance - cost);
    
    await pool.query(
      'UPDATE users SET wallet_balance = $1, last_updated = NOW() WHERE user_id = $2',
      [newBalance, user.user_id]
    );

    // 5. Log transaction
    if (cost > 0) {
      await pool.query(
        `INSERT INTO transactions (user_id, energy_kwh, rate_per_unit, cost, balance_after, transaction_type) 
         VALUES ($1, $2, $3, $4, $5, 'consumption')`,
        [user.user_id, energyKwh, ratePerUnit, cost, newBalance]
      );
    }

    // 6. Check if cutoff needed
    if (newBalance <= 0 && data.relay_state) {
      const commandTopic = `solarsync/${deviceId}/command`;
      mqttClient.publish(commandTopic, JSON.stringify({ command: 'CUTOFF' }));
      console.log(`⚡ Balance depleted for ${deviceId}. CUTOFF sent.`);
      
      await pool.query(
        `INSERT INTO events (device_id, event_type, description) VALUES ($1, 'cutoff', 'Wallet balance depleted')`,
        [deviceId]
      );
    }

    // 7. Log for debugging
    if (Math.random() < 0.01) { // Log 1% of readings to avoid spam
      console.log(`📊 ${deviceId}: ${powerWatts}W | ₹${ratePerUnit}/unit | Cost: ₹${cost.toFixed(4)} | Balance: ₹${newBalance.toFixed(2)}`);
    }

  } catch (error) {
    console.error('Error handling energy data:', error);
  }
}

async function handleDeviceStatus(deviceId, data) {
  try {
    await pool.query(
      `UPDATE users SET 
        last_seen = NOW(),
        device_status = $1,
        relay_state = $2,
        wifi_rssi = $3
       WHERE device_id = $4`,
      [
        data.status || 'unknown',
        data.relay_state || false,
        data.wifi_rssi || 0,
        deviceId
      ]
    );
  } catch (error) {
    console.error('Error handling device status:', error);
  }
}

async function handleDeviceAlert(deviceId, data) {
  try {
    await pool.query(
      `INSERT INTO alerts (device_id, severity, message, created_at) VALUES ($1, $2, $3, NOW())`,
      [deviceId, data.severity || 'info', data.message || 'Unknown alert']
    );
    
    console.log(`🚨 ALERT [${data.severity}] from ${deviceId}: ${data.message}`);
    
    // If critical, send notification to provider
    if (data.severity === 'critical') {
      mqttClient.publish('solarsync/notifications/provider', JSON.stringify({
        type: 'critical_alert',
        deviceId: deviceId,
        message: data.message,
        timestamp: Date.now(),
      }));
    }
  } catch (error) {
    console.error('Error handling device alert:', error);
  }
}

// ==================== AUTH MIDDLEWARE ====================
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// ==================== REST API ENDPOINTS ====================

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mqtt_connected: mqttClient.connected,
    current_rate: pricingEngine.getCurrentRate(),
  });
});

// ==================== AUTH ENDPOINTS ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, role, deviceId } = req.body;

    // Validate
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email exists
    const existingUser = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password_hash, role, device_id, wallet_balance, security_deposit) 
       VALUES ($1, $2, $3, $4, $5, $6, 0.00, 2000.00) RETURNING user_id, name, email, role`,
      [name, email, phone, hashedPassword, role, deviceId || null]
    );

    // Generate token
    const token = jwt.sign(
      { userId: result.rows[0].user_id, role: result.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    res.status(201).json({
      message: 'Registration successful',
      user: result.rows[0],
      token: token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      'SELECT user_id, name, email, role, password_hash, device_id FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY || '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        device_id: user.device_id,
      },
      token: token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ==================== WALLET ENDPOINTS ====================

// Get wallet balance
app.get('/api/wallet/:deviceId', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT wallet_balance, last_updated FROM users WHERE device_id = $1',
      [req.params.deviceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      balance: parseFloat(result.rows[0].wallet_balance),
      lastUpdated: result.rows[0].last_updated,
      currentRate: pricingEngine.getCurrentRate(),
    });
  } catch (error) {
    console.error('Wallet query error:', error);
    res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// Recharge wallet
app.post('/api/wallet/recharge', authenticateToken, async (req, res) => {
  try {
    const { deviceId, amount, paymentMethod } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    // Update wallet
    const result = await pool.query(
      `UPDATE users SET wallet_balance = wallet_balance + $1, last_updated = NOW() 
       WHERE device_id = $2 RETURNING wallet_balance, user_id`,
      [amount, deviceId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log recharge transaction
    await pool.query(
      `INSERT INTO transactions (user_id, energy_kwh, rate_per_unit, cost, balance_after, transaction_type, payment_method) 
       VALUES ($1, 0, 0, $2, $3, 'recharge', $4)`,
      [result.rows[0].user_id, amount, result.rows[0].wallet_balance, paymentMethod || 'upi']
    );

    // If balance was 0 and now positive, restore supply
    if (result.rows[0].wallet_balance > 0) {
      const commandTopic = `solarsync/${deviceId}/command`;
      mqttClient.publish(commandTopic, JSON.stringify({ command: 'RESTORE' }));
      console.log(`✅ Supply restored for ${deviceId} after recharge`);
    }

    res.json({
      message: 'Recharge successful',
      newBalance: parseFloat(result.rows[0].wallet_balance),
      amount: amount,
    });
  } catch (error) {
    console.error('Recharge error:', error);
    res.status(500).json({ error: 'Recharge failed' });
  }
});

// ==================== TRANSACTION ENDPOINTS ====================

// Get transaction history
app.get('/api/transactions/:deviceId', authenticateToken, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const result = await pool.query(
      `SELECT t.transaction_id, t.energy_kwh, t.rate_per_unit, t.cost, 
              t.balance_after, t.transaction_type, t.created_at,
              u.device_id
       FROM transactions t 
       JOIN users u ON t.user_id = u.user_id 
       WHERE u.device_id = $1 
       ORDER BY t.created_at DESC 
       LIMIT $2 OFFSET $3`,
      [req.params.deviceId, limit, offset]
    );

    res.json({
      transactions: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Transaction query error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ==================== DEVICE CONTROL ENDPOINTS ====================

// Remote disconnect (Provider only)
app.post('/api/device/disconnect', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Provider access required' });
    }

    const { targetDeviceId, reason } = req.body;

    const commandTopic = `solarsync/${targetDeviceId}/command`;
    mqttClient.publish(commandTopic, JSON.stringify({ 
      command: 'CUTOFF',
      reason: reason || 'Remote disconnect by provider'
    }));

    await pool.query(
      `INSERT INTO events (device_id, event_type, description, triggered_by) 
       VALUES ($1, 'remote_disconnect', $2, $3)`,
      [targetDeviceId, reason || 'Remote disconnect', req.user.userId]
    );

    res.json({ message: 'Disconnect command sent', deviceId: targetDeviceId });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Disconnect failed' });
  }
});

// Remote restore (Provider only)
app.post('/api/device/restore', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Provider access required' });
    }

    const { targetDeviceId } = req.body;

    const commandTopic = `solarsync/${targetDeviceId}/command`;
    mqttClient.publish(commandTopic, JSON.stringify({ command: 'RESTORE' }));

    res.json({ message: 'Restore command sent', deviceId: targetDeviceId });
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ error: 'Restore failed' });
  }
});

// ==================== PRICING ENDPOINTS ====================

// Get current rate
app.get('/api/pricing/current', (req, res) => {
  res.json({
    currentRate: pricingEngine.getCurrentRate(),
    minRate: pricingEngine.minRate,
    maxRate: pricingEngine.maxRate,
    lastChangeTime: pricingEngine.lastChangeTime,
  });
});

// Get rate history
app.get('/api/pricing/history', (req, res) => {
  res.json({
    history: pricingEngine.rateHistory.slice(-24),
    currentRate: pricingEngine.getCurrentRate(),
  });
});

// ==================== PROVIDER DASHBOARD ENDPOINTS ====================

// Get provider summary
app.get('/api/provider/summary', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ error: 'Provider access required' });
    }

    // Get connected consumers
    const consumers = await pool.query(
      `SELECT u.user_id, u.name, u.device_id, u.wallet_balance, 
              u.device_status, u.relay_state, u.last_seen
       FROM users u 
       WHERE u.role = 'consumer' 
       ORDER BY u.last_seen DESC`
    );

    // Get today's earnings
    const earnings = await pool.query(
      `SELECT COALESCE(SUM(t.cost), 0) as total_earnings,
              COALESCE(SUM(t.energy_kwh), 0) as total_units
       FROM transactions t
       WHERE t.transaction_type = 'consumption'
       AND t.created_at >= CURRENT_DATE`
    );

    // Get this month's earnings
    const monthlyEarnings = await pool.query(
      `SELECT COALESCE(SUM(t.cost), 0) as total_earnings
       FROM transactions t
       WHERE t.transaction_type = 'consumption'
       AND t.created_at >= DATE_TRUNC('month', CURRENT_DATE)`
    );

    res.json({
      consumers: consumers.rows,
      todayEarnings: parseFloat(earnings.rows[0].total_earnings),
      todayUnits: parseFloat(earnings.rows[0].total_units),
      monthlyEarnings: parseFloat(monthlyEarnings.rows[0].total_earnings),
      currentRate: pricingEngine.getCurrentRate(),
    });
  } catch (error) {
    console.error('Provider summary error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// ==================== CONSUMER DASHBOARD ENDPOINTS ====================

// Get consumer live data
app.get('/api/consumer/live/:deviceId', authenticateToken, async (req, res) => {
  try {
    // Get latest reading from InfluxDB
    const result = await influx.query(`
      SELECT * FROM energy_consumption 
      WHERE device_id = '${req.params.deviceId}' 
      ORDER BY time DESC LIMIT 1
    `);

    // Get wallet info
    const walletResult = await pool.query(
      'SELECT wallet_balance, relay_state FROM users WHERE device_id = $1',
      [req.params.deviceId]
    );

    if (result.length === 0 || walletResult.rows.length === 0) {
      return res.status(404).json({ error: 'No data available' });
    }

    const reading = result[0];
    const wallet = walletResult.rows[0];

    res.json({
      liveData: {
        voltage: reading.voltage,
        current: reading.current,
        power: reading.power,
        energy: reading.energy,
        frequency: reading.frequency,
        powerFactor: reading.power_factor,
      },
      wallet: {
        balance: parseFloat(wallet.wallet_balance),
        relayState: wallet.relay_state,
      },
      pricing: {
        currentRate: pricingEngine.getCurrentRate(),
        deductionPerSecond: ((reading.power / 1000) * pricingEngine.getCurrentRate()) / 3600,
      },
    });
  } catch (error) {
    console.error('Consumer live data error:', error);
    res.status(500).json({ error: 'Failed to fetch live data' });
  }
});

// ==================== DISPUTE / SUPPORT ENDPOINTS ====================

// Raise dispute ticket
app.post('/api/support/ticket', authenticateToken, async (req, res) => {
  try {
    const { deviceId, issueType, description } = req.body;

    // Get last 24 hours of data for context
    const recentData = await influx.query(`
      SELECT * FROM energy_consumption 
      WHERE device_id = '${deviceId}' 
      AND time > now() - 24h 
      ORDER BY time DESC
    `);

    const result = await pool.query(
      `INSERT INTO support_tickets (user_id, device_id, issue_type, description, data_context, status) 
       VALUES ($1, $2, $3, $4, $5, 'open') RETURNING ticket_id`,
      [
        req.user.userId,
        deviceId,
        issueType,
        description,
        JSON.stringify(recentData.slice(0, 100)), // Last 100 readings
      ]
    );

    res.status(201).json({
      message: 'Ticket created successfully',
      ticketId: result.rows[0].ticket_id,
      dataPointsIncluded: recentData.length,
    });
  } catch (error) {
    console.error('Ticket creation error:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// ==================== AGREEMENT ENDPOINTS ====================

// Accept agreement
app.post('/api/agreement/accept', authenticateToken, async (req, res) => {
  try {
    const { version } = req.body;

    await pool.query(
      `INSERT INTO agreements (user_id, agreement_version, ip_address) 
       VALUES ($1, $2, $3)`,
      [req.user.userId, version || '1.0', req.ip]
    );

    res.json({ message: 'Agreement accepted', version: version || '1.0' });
  } catch (error) {
    console.error('Agreement error:', error);
    res.status(500).json({ error: 'Failed to record agreement' });
  }
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connections
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected');

    await influx.getDatabaseNames().then(names => {
      if (!names.includes(process.env.INFLUX_DB)) {
        return influx.createDatabase(process.env.INFLUX_DB);
      }
    });
    console.log('✅ InfluxDB connected');

    // Start Express server
    app.listen(PORT, () => {
      console.log(`\n🚀 SolarSync Backend running on port ${PORT}`);
      console.log(`📡 MQTT Broker: ${process.env.MQTT_BROKER}`);
      console.log(`💰 Default Rate: ₹${pricingEngine.getCurrentRate()}/unit`);
      console.log(`🌐 API: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  mqttClient.end();
  await pool.end();
  process.exit(0);
});
