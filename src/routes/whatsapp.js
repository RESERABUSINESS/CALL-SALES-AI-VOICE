const express = require('express');
const whatsapp = require('../services/whatsapp');

const router = express.Router();

router.post('/webhook', async (req, res) => {
  const { From, Body, WaId } = req.body;

  if (!Body) {
    res.status(200).send('OK');
    return;
  }

  const phoneNumber = From ? From.replace('whatsapp:', '') : WaId;

  try {
    await whatsapp.handleIncomingMessage(phoneNumber, Body);
    res.status(200).send('OK');
  } catch (err) {
    console.error('WhatsApp webhook error:', err);
    res.status(200).send('OK');
  }
});

router.post('/send', async (req, res) => {
  const { to, message } = req.body;

  if (!to || !message) {
    res.status(400).json({ error: 'to and message are required' });
    return;
  }

  try {
    const result = await whatsapp.sendMessage(to, message);
    res.json({ success: true, messageSid: result.sid });
  } catch (err) {
    console.error('WhatsApp send error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/reminder', async (req, res) => {
  const { to, appointment } = req.body;

  if (!to || !appointment) {
    res.status(400).json({ error: 'to and appointment are required' });
    return;
  }

  try {
    const result = await whatsapp.sendAppointmentReminder(to, appointment);
    res.json({ success: true, messageSid: result.sid });
  } catch (err) {
    console.error('Reminder send error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
