const request = require('supertest');
const app = require('../src/server');

describe('Appointments API', () => {
  test('GET /api/appointments/slots without date returns 400', async () => {
    const res = await request(app).get('/api/appointments/slots');
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/date/i);
  });

  test('POST /api/appointments/book without required fields returns 400', async () => {
    const res = await request(app)
      .post('/api/appointments/book')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/required/i);
  });

  test('POST /api/appointments/book without startTime returns 400', async () => {
    const res = await request(app)
      .post('/api/appointments/book')
      .send({ summary: 'test' });
    expect(res.statusCode).toBe(400);
  });

  test('POST /api/appointments/chat without message returns 400', async () => {
    const res = await request(app)
      .post('/api/appointments/chat')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/message/i);
  });
});
