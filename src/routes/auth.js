const express = require('express');
const calendar = require('../services/calendar');

const router = express.Router();

router.get('/google', (req, res) => {
  const url = calendar.getAuthUrl();
  res.redirect(url);
});

router.get('/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    res.status(400).send('Missing authorization code');
    return;
  }

  try {
    await calendar.handleCallback(code);
    res.redirect('/?auth=success');
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(500).send('Authentication failed: ' + err.message);
  }
});

router.get('/status', (req, res) => {
  res.json({ authenticated: calendar.isAuthenticated() });
});

module.exports = router;
