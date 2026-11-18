const env = require('./config/env');
const { createApp } = require('./app');
const prisma = require('./lib/prisma');
const modules = require('./modules');

const app = createApp();

// Each module may export register() to subscribe to events or start jobs (M8, M11, M12).
for (const mod of modules) {
  if (typeof mod.register === 'function') mod.register();
}

const server = app.listen(env.PORT, () => {
  console.log(`BBTMS API listening on http://localhost:${env.PORT}/api/v1`);
});

// Graceful shutdown: stop taking new requests, let running ones finish, then close the database.
// A deadline makes sure a stuck request cannot keep the process alive forever.
const SHUTDOWN_DEADLINE_MS = 10_000;
let shuttingDown = false;

function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down`);

  const deadline = setTimeout(() => {
    console.error('Shutdown took too long, forcing exit');
    process.exit(1);
  }, SHUTDOWN_DEADLINE_MS);
  deadline.unref();

  server.close(async (err) => {
    await prisma.$disconnect().catch(() => {});
    process.exit(err ? 1 : 0);
  });
  server.closeIdleConnections?.();
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
