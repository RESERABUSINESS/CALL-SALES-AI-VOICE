const twilio = require('twilio');
const config = require('../config/env');
const ai = require('./ai');

const client = twilio(config.twilio.accountSid, config.twilio.authToken);

async function sendMessage(to, body) {
  const message = await client.messages.create({
    from: `whatsapp:${config.twilio.whatsappNumber}`,
    to: `whatsapp:${to}`,
    body,
  });
  return message;
}

async function sendTemplateMessage(to, templateSid, variables = {}) {
  const message = await client.messages.create({
    from: `whatsapp:${config.twilio.whatsappNumber}`,
    to: `whatsapp:${to}`,
    contentSid: templateSid,
    contentVariables: JSON.stringify(variables),
  });
  return message;
}

async function handleIncomingMessage(from, body, sessionId) {
  const result = await ai.chat(sessionId || from, body);

  await sendMessage(from, result.message);

  if (result.booking) {
    const confirmMsg = `تم حجز موعدك بنجاح!\n` +
      `الخدمة: ${result.booking.summary}\n` +
      `التاريخ: ${result.booking.date}\n` +
      `الوقت: ${result.booking.time}\n` +
      `رقم الحجز: ${result.booking.eventId}`;
    await sendMessage(from, confirmMsg);
  }

  return result;
}

async function sendAppointmentReminder(to, appointment) {
  const msg = `تذكير بموعدك:\n` +
    `الخدمة: ${appointment.summary}\n` +
    `التاريخ: ${new Date(appointment.start.dateTime).toLocaleDateString('ar-SA')}\n` +
    `الوقت: ${new Date(appointment.start.dateTime).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}\n\n` +
    `للإلغاء أو التعديل رد على هالرسالة.`;

  return sendMessage(to, msg);
}

module.exports = {
  sendMessage,
  sendTemplateMessage,
  handleIncomingMessage,
  sendAppointmentReminder,
};
