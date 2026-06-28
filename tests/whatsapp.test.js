const request = require('supertest');
const app = require('../src/server');

describe('WhatsApp API', () => {
  test('POST /api/whatsapp/webhook without body returns 200', async () => {
    const res = await request(app)
      .post('/api/whatsapp/webhook')
      .send({});
    expect(res.statusCode).toBe(200);
  });

  test('POST /api/whatsapp/send without params returns 400', async () => {
    const res = await request(app)
      .post('/api/whatsapp/send')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  test('POST /api/whatsapp/reminder without params returns 400', async () => {
    const res = await request(app)
      .post('/api/whatsapp/reminder')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });
});
