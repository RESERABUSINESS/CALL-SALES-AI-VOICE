const request = require('supertest');
const app = require('../src/server');

describe('Auth API', () => {
  test('GET /auth/status returns authentication status', async () => {
    const res = await request(app).get('/auth/status');
    expect(res.statusCode).toBe(200);
    expect(typeof res.body.authenticated).toBe('boolean');
  });

  test('GET /auth/google redirects to Google OAuth', async () => {
    const res = await request(app).get('/auth/google');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toContain('accounts.google.com');
  });

  test('GET /auth/google/callback without code returns 400', async () => {
    const res = await request(app).get('/auth/google/callback');
    expect(res.statusCode).toBe(400);
  });
});
