// Builds the Express app (application layer, SRS Section 5.2).
const express = require('express');
const helmet = require('helmet');
const env = require('./config/env');
const prisma = require('./lib/prisma');
const clock = require('./lib/clock');
const sessionMiddleware = require('./middleware/session');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');
const modules = require('./modules');

function createApp() {
  const app = express();
  app.set('trust proxy', 1); // behind Nginx in production
  app.use(helmet());

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

  // Staging-only clock control (SRS Section 9.2)
  if (env.ALLOW_CLOCK_CONTROL) {
    api.post('/test/clock', (req, res) => {
      if (req.body?.reset) clock.reset();
      else clock.setNow(req.body.now);
      res.json({ now: clock.now() });
    });
  }

  for (const mod of modules) {
    if (mod.router) api.use(mod.router);
  }

  app.use('/api/v1', api);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
