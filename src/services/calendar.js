const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const config = require('../config/env');

const TOKENS_PATH = path.join(__dirname, '../../tokens.json');

const oauth2Client = new google.auth.OAuth2(
  config.google.clientId,
  config.google.clientSecret,
  config.google.redirectUri
);

function loadTokens() {
  if (fs.existsSync(TOKENS_PATH)) {
    const tokens = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
    oauth2Client.setCredentials(tokens);
    return true;
  }
  return false;
}

function saveTokens(tokens) {
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));
}

function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
  });
}

async function handleCallback(code) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  saveTokens(tokens);
  return tokens;
}

function isAuthenticated() {
  return loadTokens();
}

async function getAvailableSlots(date) {
  loadTokens();
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const startOfDay = new Date(date);
  startOfDay.setHours(9, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(17, 0, 0, 0);

  const res = await calendar.events.list({
    calendarId: config.google.calendarId,
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  });

  const busySlots = (res.data.items || []).map((event) => ({
    start: new Date(event.start.dateTime || event.start.date),
    end: new Date(event.end.dateTime || event.end.date),
  }));

  const available = [];
  let cursor = new Date(startOfDay);

  for (const busy of busySlots) {
    if (cursor < busy.start) {
      available.push({
        start: new Date(cursor),
        end: new Date(busy.start),
      });
    }
    if (busy.end > cursor) {
      cursor = new Date(busy.end);
    }
  }

  if (cursor < endOfDay) {
    available.push({
      start: new Date(cursor),
      end: new Date(endOfDay),
    });
  }

  return available;
}

async function bookAppointment({ summary, description, startTime, endTime, attendeeEmail }) {
  loadTokens();
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const event = {
    summary,
    description,
    start: { dateTime: new Date(startTime).toISOString(), timeZone: 'Asia/Riyadh' },
    end: { dateTime: new Date(endTime).toISOString(), timeZone: 'Asia/Riyadh' },
  };

  if (attendeeEmail) {
    event.attendees = [{ email: attendeeEmail }];
  }

  const res = await calendar.events.insert({
    calendarId: config.google.calendarId,
    resource: event,
    sendUpdates: 'all',
  });

  return res.data;
}

async function listUpcomingAppointments(maxResults = 10) {
  loadTokens();
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  const res = await calendar.events.list({
    calendarId: config.google.calendarId,
    timeMin: new Date().toISOString(),
    maxResults,
    singleEvents: true,
    orderBy: 'startTime',
  });

  return res.data.items || [];
}

module.exports = {
  getAuthUrl,
  handleCallback,
  isAuthenticated,
  getAvailableSlots,
  bookAppointment,
  listUpcomingAppointments,
};
