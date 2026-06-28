const twilio = require('twilio');
const config = require('../config/env');
const ai = require('./ai');

const twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);
const VoiceResponse = twilio.twiml.VoiceResponse;

function createGatherResponse(message) {
  const twiml = new VoiceResponse();
  const gather = twiml.gather({
    input: 'speech',
    language: 'ar-SA',
    action: '/api/voice/respond',
    method: 'POST',
    speechTimeout: 'auto',
  });
  gather.say({ language: 'ar-SA', voice: 'Google.ar-XA-Wavenet-A' }, message);
  twiml.redirect('/api/voice/incoming');
  return twiml.toString();
}

function createWelcomeResponse() {
  return createGatherResponse('أهلاً وسهلاً! أنا مساعدك الذكي لحجز المواعيد. كيف أقدر أساعدك اليوم؟');
}

async function handleSpeechInput(sessionId, speechResult) {
  const { message } = await ai.chat(sessionId, speechResult);
  return createGatherResponse(message);
}

async function makeOutboundCall(to, message) {
  const call = await twilioClient.calls.create({
    to,
    from: config.twilio.phoneNumber,
    twiml: createGatherResponse(message || 'أهلاً! نتواصل معك بخصوص موعدك. هل تبي تحجز موعد جديد؟'),
  });
  return call;
}

module.exports = { createWelcomeResponse, handleSpeechInput, makeOutboundCall };
