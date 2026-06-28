const express = require('express');
const voice = require('../services/voice');

const router = express.Router();

router.post('/incoming', (req, res) => {
  res.type('text/xml');
  res.send(voice.createWelcomeResponse());
});

router.post('/respond', async (req, res) => {
  const sessionId = req.body.CallSid;
  const speechResult = req.body.SpeechResult;

  if (!speechResult) {
    res.type('text/xml');
    res.send(voice.createWelcomeResponse());
    return;
  }

  try {
    const twiml = await voice.handleSpeechInput(sessionId, speechResult);
    res.type('text/xml');
    res.send(twiml);
  } catch (err) {
    console.error('Voice respond error:', err);
    res.type('text/xml');
    const VoiceResponse = require('twilio').twiml.VoiceResponse;
    const errorTwiml = new VoiceResponse();
    errorTwiml.say({ language: 'ar-SA' }, 'عذراً، حصل خطأ. حاول مرة ثانية.');
    res.send(errorTwiml.toString());
  }
});

router.post('/outbound', async (req, res) => {
  const { phoneNumber, message } = req.body;

  if (!phoneNumber) {
    res.status(400).json({ error: 'phoneNumber is required' });
    return;
  }

  try {
    const call = await voice.makeOutboundCall(phoneNumber, message);
    res.json({ success: true, callSid: call.sid });
  } catch (err) {
    console.error('Outbound call error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
