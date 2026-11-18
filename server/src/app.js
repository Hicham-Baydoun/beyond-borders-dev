// Builds the Express app (application layer, SRS Section 5.2).
const fs = require('fs');
const path = require('path');
const express = require('express');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { z } = require('zod');
const validate = require('./middleware/validate');
const env = require('./config/env');
const prisma = require('./lib/prisma');
const clock = require('./lib/clock');
const sessionMiddleware = require('./middleware/session');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const modules = require('./modules');

const CLIENT_DIST = path.resolve(__dirname, '..', '..', 'client', 'dist');

function createApp() {
  const app = express();
  app.set('trust proxy', 1); // one proxy in front (Render or Nginx), so req.ip is the real client
  app.use(helmet());

  // Basic flood protection for every route, applied before sessions so floods never reach the database.
  // Stricter limits for login and password reset belong to M1 (FR-ACC).
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      limit: 300, // per IP per minute: far above normal use, low enough to stop scripts
      standardHeaders: 'draft-8',
      legacyHeaders: false,
      skip: () => env.NODE_ENV === 'test',
      handler: (_req, res) =>
        res.status(429).json({ error: 'Too many requests from your network. Wait a minute, then try again.' }),
    }),
  );

  // Keep the raw body: the payment webhook needs it to check the gateway signature (FR-PAY-03).
  app.use(express.json({ limit: '1mb', verify: (req, _res, buf) => { req.rawBody = buf; } }));
  app.use(sessionMiddleware);

  const api = express.Router();

  // Monitored by Uptime Kuma (NFR-AVA-01)
  api.get('/health', async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ok', database: 'up', time: clock.now() });
    } catch {
      res.status(503).json({ status: 'error', database: 'down' });
    }
  });

  // Staging-only clock control (SRS Section 9.2). env.js refuses to start production with it on.
  // Body: { "reset": true } or { "now": "2027-06-01T09:00:00Z" }
  if (env.ALLOW_CLOCK_CONTROL) {
    const clockCommand = z.union([
      z.object({ reset: z.literal(true) }).strict(),
      z.object({ now: z.string().datetime({ offset: true }) }).strict(),
    ]);
    api.post('/test/clock', validate({ body: clockCommand }), (req, res) => {
      if ('reset' in req.body) clock.reset();
      else clock.setNow(req.body.now);
      res.json({ now: clock.now() });
    });
  }

  for (const mod of modules) {
    if (mod.router) api.use(mod.router);
  }

  app.use('/api/v1', api);
  // Unknown API addresses get a JSON 404, never the React page. Express paths are
  // case-insensitive, so this also catches /API/... before the fallback below.
  app.use('/api', notFoundHandler);

  // In production one server hosts both: the API above and the built React app (client/dist).
  // Same origin means the session cookie works without any CORS setup.
  if (env.NODE_ENV === 'production' && fs.existsSync(CLIENT_DIST)) {
    app.use(express.static(CLIENT_DIST, { index: false, maxAge: '1h' }));
    // Any other GET is a React route (/api was handled above): send index.html, React Router takes over.
    app.get('*', (_req, res) => res.sendFile(path.join(CLIENT_DIST, 'index.html')));
  }

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
