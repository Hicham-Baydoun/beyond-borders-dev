// Smoke test: the app boots, the health route exists and unknown routes give a clear 404.
const request = require('supertest');
const { createApp } = require('../src/app');
const prisma = require('../src/lib/prisma');

const app = createApp();

afterAll(() => prisma.$disconnect());

test('GET /api/v1/health answers', async () => {
  const res = await request(app).get('/api/v1/health');
  expect([200, 503]).toContain(res.status);
  expect(res.body).toHaveProperty('status');
});

test('unknown route returns a JSON 404', async () => {
  const res = await request(app).get('/api/v1/does-not-exist');
  expect(res.status).toBe(404);
  expect(res.body.error).toBeDefined();
});
