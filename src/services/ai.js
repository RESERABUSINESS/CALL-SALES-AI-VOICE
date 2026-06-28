const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config/env');
const calendar = require('./calendar');

const client = new Anthropic({ apiKey: config.anthropic.apiKey });

const SYSTEM_PROMPT = `أنت مساعد ذكي لحجز المواعيد. مهمتك:
1. الترحيب بالعميل بلطف
2. سؤاله عن الخدمة المطلوبة
3. سؤاله عن التاريخ والوقت المفضل
4. تأكيد الحجز

عند جمع المعلومات الكافية، أجب بصيغة JSON داخل علامات <booking>:
<booking>
{
  "action": "book",
  "summary": "وصف الموعد",
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "duration": 30,
  "customer_name": "اسم العميل",
  "customer_email": "الإيميل إن وجد",
  "customer_phone": "رقم الجوال"
}
</booking>

إذا طلب العميل معرفة الأوقات المتاحة أجب بـ:
<booking>{"action": "check_availability", "date": "YYYY-MM-DD"}</booking>

تحدث بالعربية بشكل ودود ومهني.`;

const conversations = new Map();

async function chat(sessionId, userMessage) {
  if (!conversations.has(sessionId)) {
    conversations.set(sessionId, []);
  }

  const history = conversations.get(sessionId);
  history.push({ role: 'user', content: userMessage });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: history,
  });

  const assistantMessage = response.content[0].text;
  history.push({ role: 'assistant', content: assistantMessage });

  const bookingMatch = assistantMessage.match(/<booking>([\s\S]*?)<\/booking>/);
  let bookingResult = null;

  if (bookingMatch) {
    try {
      const bookingData = JSON.parse(bookingMatch[1]);

      if (bookingData.action === 'check_availability') {
        const slots = await calendar.getAvailableSlots(bookingData.date);
        const slotsText = slots
          .map((s) => `${s.start.toLocaleTimeString('ar-SA')} - ${s.end.toLocaleTimeString('ar-SA')}`)
          .join('\n');

        const followUp = `الأوقات المتاحة في ${bookingData.date}:\n${slotsText}\n\nأي وقت يناسبك؟`;
        history.push({ role: 'user', content: followUp });

        const followUpResponse = await client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: history,
        });

        const followUpText = followUpResponse.content[0].text;
        history.push({ role: 'assistant', content: followUpText });
        return { message: followUpText, booking: null };
      }

      if (bookingData.action === 'book') {
        const startTime = new Date(`${bookingData.date}T${bookingData.time}:00`);
        const endTime = new Date(startTime.getTime() + bookingData.duration * 60000);

        const event = await calendar.bookAppointment({
          summary: bookingData.summary,
          description: `العميل: ${bookingData.customer_name}\nالجوال: ${bookingData.customer_phone || 'غير محدد'}`,
          startTime,
          endTime,
          attendeeEmail: bookingData.customer_email,
        });

        bookingResult = { ...bookingData, eventId: event.id, eventLink: event.htmlLink };
      }
    } catch (err) {
      console.error('Booking error:', err.message);
    }
  }

  const cleanMessage = assistantMessage.replace(/<booking>[\s\S]*?<\/booking>/g, '').trim();
  return { message: cleanMessage, booking: bookingResult };
}

function clearSession(sessionId) {
  conversations.delete(sessionId);
}

module.exports = { chat, clearSession };
