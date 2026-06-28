require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER,
  },
  nabrah: {
    apiKey: process.env.NABRAH_API_KEY,
    baseUrl: process.env.NABRAH_BASE_URL || 'https://api.nabrah.ai/v1',
    defaultVoice: process.env.NABRAH_DEFAULT_VOICE || 'saudi_male_1',
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
  },
};
