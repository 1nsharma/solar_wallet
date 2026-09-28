// notification_agent.js
/*
  Notification Agent - Firebase Cloud Messaging (FCM) integration
  Provides an HTTP endpoint to send push notifications to registered devices.
  Uses Firebase Admin SDK. Replace `serviceAccountKey.json` with your Firebase service account credentials.
*/

const admin = require('firebase-admin');
const express = require('express');
const bodyParser = require('body-parser');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json'); // placeholder path
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
app.use(bodyParser.json());

// Endpoint to send a notification
// POST /send with body { token: string, title: string, body: string, data?: object }
app.post('/send', async (req, res) => {
  const { token, title, body, data } = req.body;
  if (!token || !title || !body) {
    return res.status(400).json({ error: 'Missing required fields (token, title, body)' });
  }
  const message = {
    token,
    notification: { title, body },
    data: data || {},
  };
  try {
    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    res.json({ success: true, messageId: response });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Notification Agent listening on port ${PORT}`);
});
