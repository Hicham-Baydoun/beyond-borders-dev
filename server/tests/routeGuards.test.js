// FR-ACC-04: every API route must say who may use it. A route without requireAuth, requireRole or
// publicRoute fails this test, so nobody can ship an unprotected endpoint by accident.
const express = require('express');
const request = require('supertest');
const modules = require('../src/modules');
const { Roles, requireRole } = require('../src/middleware/auth');
const { errorHandler } = require('../src/middleware/errorHandler');

const GUARDS = new Set(['requireAuth', 'requireRoleCheck', 'publicRoute']);

function routesOf(router) {
  return router.stack
    .filter((layer) => layer.route)
    .map((layer) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods).join(',').toUpperCase(),
      guarded: layer.route.stack.some((h) => GUARDS.has(h.handle.name)),
    }));
}

test('every module route declares requireAuth, requireRole or publicRoute', () => {
  const unguarded = modules
    .filter((m) => m.router)
    .flatMap((m) => routesOf(m.router).map((r) => ({ module: m.name, ...r })))
    .filter((r) => !r.guarded);
  expect(unguarded).toEqual([]);
});

describe('TC-ACC-04 role checks', () => {
  // A stand-in for admin and agent routes, so the role rules are tested before those modules exist.
  const app = express();
  app.use((req, _res, next) => {
    const role = req.get('x-test-role');
    req.session = role ? { user: { id: 1, role } } : {};
    next();
  });
  app.get('/reports/sales', requireRole(Roles.ADMINISTRATOR), (_req, res) => res.json({ ok: true }));
  app.get('/customers', requireRole(Roles.AGENT, Roles.ADMINISTRATOR), (_req, res) => res.json({ ok: true }));
  app.use(errorHandler);

  test('not logged in gives 401', async () => {
    await request(app).get('/reports/sales').expect(401);
  });
  test('TC-ACC-04-02 an agent gets 403 on an admin route', async () => {
    const res = await request(app).get('/reports/sales').set('x-test-role', 'AGENT');
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Your role cannot use this function.');
  });
  test('TC-ACC-04-03 a customer gets 403 on staff routes', async () => {
    await request(app).get('/customers').set('x-test-role', 'CUSTOMER').expect(403);
  });
  test('the right role passes', async () => {
    await request(app).get('/reports/sales').set('x-test-role', 'ADMINISTRATOR').expect(200);
    await request(app).get('/customers').set('x-test-role', 'AGENT').expect(200);
  });
});
