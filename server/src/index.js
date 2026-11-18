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

async function shutdown() {
  server.close();
  await prisma.$disconnect();
  process.exit(0);
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
