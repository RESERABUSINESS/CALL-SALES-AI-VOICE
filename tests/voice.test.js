const request = require('supertest');
const app = require('../src/server');

describe('Voice API', () => {
  test('POST /api/voice/incoming returns TwiML XML', async () => {
    const res = await request(app).post('/api/voice/incoming');
    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/xml/);
    expect(res.text).toContain('<Response>');
    expect(res.text).toContain('<Gather');
    expect(res.text).toContain('ar-SA');
  });

  test('POST /api/voice/outbound without phoneNumber returns 400', async () => {
    const res = await request(app)
      .post('/api/voice/outbound')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/phoneNumber/i);
  });
});
