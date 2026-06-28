# إيجنت المواعيد الذكي - AI Appointment Agent

نظام حجز مواعيد ذكي يعمل بالذكاء الاصطناعي مع اتصال صوتي وتقويم قوقل.

## المميزات

- **شات ذكي (AI Chat)** - محادثة بالعربي لحجز المواعيد تلقائياً عبر Claude AI
- **اتصال صوتي (Voice Agent)** - مكالمات واردة وصادرة عبر Twilio مع التعرف على الكلام
- **تقويم قوقل (Google Calendar)** - مزامنة المواعيد والأوقات المتاحة
- **واجهة ويب (Dashboard)** - لوحة تحكم كاملة لإدارة المواعيد

## التقنيات

- **Backend**: Node.js + Express
- **AI**: Claude AI (Anthropic)
- **Voice**: Twilio (Speech-to-Text + Text-to-Speech)
- **Calendar**: Google Calendar API
- **Frontend**: HTML/CSS/JS

## التشغيل

### 1. تثبيت المتطلبات
```bash
npm install
```

### 2. إعداد متغيرات البيئة
```bash
cp .env.example .env
```
عدّل ملف `.env` وأضف مفاتيحك:
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER`
- `ANTHROPIC_API_KEY`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`

### 3. تشغيل السيرفر
```bash
npm run dev
```

### 4. ربط تقويم قوقل
افتح المتصفح على `http://localhost:3000` واضغط "ربط تقويم قوقل"

## API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/health` | حالة السيرفر |
| GET | `/auth/google` | بدء ربط تقويم قوقل |
| GET | `/auth/status` | حالة الربط |
| POST | `/api/appointments/chat` | محادثة الحجز الذكية |
| GET | `/api/appointments/slots?date=YYYY-MM-DD` | الأوقات المتاحة |
| POST | `/api/appointments/book` | حجز موعد |
| GET | `/api/appointments/upcoming` | المواعيد القادمة |
| POST | `/api/voice/incoming` | استقبال مكالمة (Twilio webhook) |
| POST | `/api/voice/outbound` | إجراء مكالمة صادرة |

## هيكل المشروع

```
├── src/
│   ├── server.js              # نقطة البداية
│   ├── config/env.js          # إعدادات البيئة
│   ├── routes/
│   │   ├── auth.js            # Google OAuth2
│   │   ├── voice.js           # Twilio Voice
│   │   └── appointments.js    # حجز المواعيد + شات
│   └── services/
│       ├── ai.js              # Claude AI
│       ├── calendar.js        # Google Calendar
│       └── voice.js           # معالجة الصوت
├── public/
│   └── index.html             # واجهة الويب
├── .env.example
└── package.json
```
