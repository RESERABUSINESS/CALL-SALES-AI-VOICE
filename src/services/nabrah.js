const https = require('https');
const config = require('../config/env');

const BASE_URL = config.nabrah.baseUrl || 'https://api.nabrah.ai/v1';
const API_KEY = config.nabrah.apiKey;

function makeRequest(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqOptions = {
      method: options.method || 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    const req = https.request(url, reqOptions, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const contentType = res.headers['content-type'] || '';
        if (contentType.includes('audio')) {
          resolve({ audio: Buffer.concat(chunks), contentType });
        } else {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString()));
          } catch {
            resolve({ raw: Buffer.concat(chunks).toString() });
          }
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function textToSpeech(text, options = {}) {
  const response = await makeRequest('/tts', {
    body: {
      text,
      voice: options.voice || config.nabrah.defaultVoice || 'saudi_male_1',
      language: 'ar-SA',
      format: options.format || 'mp3',
      speed: options.speed || 1.0,
    },
  });
  return response;
}

async function speechToText(audioBuffer, options = {}) {
  const response = await makeRequest('/stt', {
    body: {
      audio: audioBuffer.toString('base64'),
      language: 'ar-SA',
      dialect: options.dialect || 'saudi',
    },
  });
  return response;
}

async function listVoices() {
  const response = await makeRequest('/voices', { method: 'GET' });
  return response;
}

module.exports = { textToSpeech, speechToText, listVoices };
