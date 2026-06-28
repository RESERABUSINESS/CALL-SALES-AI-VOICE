const express = require('express');
const calendar = require('../services/calendar');
const ai = require('../services/ai');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

router.get('/slots', async (req, res) => {
  const { date } = req.query;
  if (!date) {
    res.status(400).json({ error: 'date query param is required (YYYY-MM-DD)' });
    return;
  }

  try {
    const slots = await calendar.getAvailableSlots(date);
    res.json({ date, slots });
  } catch (err) {
    console.error('Get slots error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/book', async (req, res) => {
  const { summary, startTime, endTime, attendeeEmail, description } = req.body;

  if (!summary || !startTime || !endTime) {
    res.status(400).json({ error: 'summary, startTime, and endTime are required' });
    return;
  }

  try {
    const event = await calendar.bookAppointment({
      summary,
      description: description || '',
      startTime,
      endTime,
      attendeeEmail,
    });
    res.json({ success: true, event });
  } catch (err) {
    console.error('Book error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/upcoming', async (req, res) => {
  const maxResults = parseInt(req.query.limit) || 10;

  try {
    const events = await calendar.listUpcomingAppointments(maxResults);
    res.json({ appointments: events });
  } catch (err) {
    console.error('List appointments error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/chat', async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  const sid = sessionId || uuidv4();

  try {
    const result = await ai.chat(sid, message);
    res.json({ sessionId: sid, ...result });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
