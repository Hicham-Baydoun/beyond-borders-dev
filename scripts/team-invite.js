#!/usr/bin/env node
// For the project owner: `npm run team:invite`
// Prints a message to send PRIVATELY to a teammate (WhatsApp/DM, never GitHub or Jira).
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '..', 'server', '.env');
let env;
try {
  env = fs.readFileSync(envPath, 'utf8');
} catch (err) {
  if (err.code !== 'ENOENT') throw err;
  console.error('server/.env not found. Run this on the machine that is already set up.');
  process.exit(1);
}
const get = (key) => (env.match(new RegExp(`^${key}=(.*)$`, 'm')) || [])[1]?.trim();
const databaseUrl = get('DATABASE_URL');
const encryptionKey = get('ENCRYPTION_KEY')?.replace(/^["']|["']$/g, '').toLowerCase();

if (!/^[0-9a-f]{64}$/.test(encryptionKey ?? '')) {
  console.error('ENCRYPTION_KEY in server/.env is missing or not 64 hex characters. Set the shared team key there, then run npm run team:invite again.');
  process.exit(1);
}

if (!databaseUrl || /localhost|127\.0\.0\.1/.test(databaseUrl)) {
  console.error('server/.env points to a local database, not the shared Neon one. Nothing to share.');
  process.exit(1);
}

console.log(`
------------- copy everything below this line -------------
Beyond Borders dev setup (keep this private, do not post it in the group repo):

1. Install Node.js 20+ and Git
   Windows: winget install OpenJS.NodeJS.LTS Git.Git
   Mac:     https://nodejs.org  (Git comes with: xcode-select --install)
2. git clone https://github.com/Hicham-Baydoun/beyond-borders-dev.git
3. cd beyond-borders-dev
4. npm run setup
5. When it asks, paste these:

DATABASE_URL:
${databaseUrl}

ENCRYPTION_KEY:
${encryptionKey}
------------- copy everything above this line -------------
`);
