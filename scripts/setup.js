#!/usr/bin/env node
// One-command setup for a new team member: `npm run setup`
// Installs packages, asks for the two shared secrets, writes server/.env,
// and proves the shared Neon database is reachable. Safe to run again.
const { spawnSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.resolve(__dirname, '..');
const SERVER = path.join(ROOT, 'server');
const ENV_PATH = path.join(SERVER, '.env');
const EXAMPLE_PATH = path.join(SERVER, '.env.example');

const green = (s) => `\x1b[32m${s}\x1b[0m`;
const red = (s) => `\x1b[31m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;

function step(n, text) {
  console.log(`\n${bold(`[${n}/5]`)} ${text}`);
}

function fail(message) {
  console.error(`\n${red('Setup stopped:')} ${message}\n`);
  process.exit(1);
}

// Commands are fixed strings written here (never user input), run through the shell so
// npm/npx resolve on Windows and Mac alike.
function run(command, cwd = ROOT) {
  return spawnSync(command, { cwd, stdio: 'inherit', shell: true }).status === 0;
}

function hasCommand(cmd) {
  return spawnSync(`${cmd} --version`, { stdio: 'ignore', shell: true }).status === 0;
}

// Reads all answers up front so piped input works too.
function createPrompter() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const lines = [];
  const waiters = [];
  rl.on('line', (line) => (waiters.length ? waiters.shift()(line) : lines.push(line)));
  rl.on('close', () => waiters.splice(0).forEach((w) => w('')));
  return {
    ask(question) {
      process.stdout.write(question);
      return new Promise((resolve) => (lines.length ? resolve(lines.shift()) : waiters.push(resolve)));
    },
    close: () => rl.close(),
  };
}

function cleanDatabaseUrl(raw) {
  let url = raw.trim().replace(/^["']|["']$/g, '');
  if (url.startsWith('DATABASE_URL=')) url = url.slice('DATABASE_URL='.length);
  // Prisma's driver does not support channel_binding; SSL stays on through sslmode=require.
  url = url.replace(/[&?]channel_binding=[^&]*/g, '');
  if (!/^postgres(ql)?:\/\/[^:]+:[^@]+@[^/]+\/\w+/.test(url)) return null;
  if (!/sslmode=require/.test(url)) url += (url.includes('?') ? '&' : '?') + 'sslmode=require';
  return url;
}

function cleanKey(raw) {
  let key = raw.trim().replace(/^["']|["']$/g, '');
  if (key.startsWith('ENCRYPTION_KEY=')) key = key.slice('ENCRYPTION_KEY='.length);
  return /^[0-9a-fA-F]{64}$/.test(key) ? key.toLowerCase() : null;
}

// Reads/copies directly and handles ENOENT instead of checking existsSync first,
// so there is no gap where the file could change between the check and the use.
function writeEnv(databaseUrl, encryptionKey) {
  let env;
  try {
    env = fs.readFileSync(EXAMPLE_PATH, 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') fail('server/.env.example is missing. Pull the latest code first (git pull).');
    throw err;
  }
  env = env
    .replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${databaseUrl}`)
    .replace(/^ENCRYPTION_KEY=.*$/m, `ENCRYPTION_KEY=${encryptionKey}`)
    .replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET=${crypto.randomBytes(36).toString('base64url')}`);

  try {
    fs.copyFileSync(ENV_PATH, `${ENV_PATH}.backup`);
    console.log(`  Your old server/.env was saved as server/.env.backup`);
  } catch (err) {
    if (err.code !== 'ENOENT') throw err; // no old .env: nothing to back up
  }
  // 0o600: only your user can read the file that holds the secrets (ignored on Windows).
  fs.writeFileSync(ENV_PATH, env, { mode: 0o600 });
}

function checkDatabase() {
  const probe = `
    const { PrismaClient } = require('@prisma/client');
    const p = new PrismaClient();
    p.$queryRaw\`SELECT (SELECT count(*)::int FROM package) AS packages, (SELECT count(*)::int FROM staff_user) AS staff\`
      .then((r) => { console.log(JSON.stringify(r[0])); return p.$disconnect(); })
      .catch((e) => { console.error(e.message.split('\\n').slice(-2).join(' ')); process.exit(1); });`;
  const result = spawnSync(process.execPath, ['-r', 'dotenv/config', '-e', probe], {
    cwd: SERVER,
    encoding: 'utf8',
  });
  return { ok: result.status === 0, out: (result.stdout || '').trim(), err: (result.stderr || '').trim() };
}

async function main() {
  console.log(bold('\nBeyond Borders (BBTMS) - team setup\n'));

  step(1, 'Checking tools');
  const major = Number(process.versions.node.split('.')[0]);
  if (major < 20) fail(`Node.js ${process.versions.node} is too old. Install Node 20 or newer from https://nodejs.org`);
  console.log(`  Node.js ${process.versions.node} ${green('OK')}`);
  if (!hasCommand('git')) fail('Git is not installed. Windows: winget install Git.Git   Mac: xcode-select --install');
  console.log(`  Git ${green('OK')}`);

  step(2, 'Installing packages (this can take a few minutes)');
  if (!run('npm install')) fail('npm install failed. Check your internet connection and run `npm run setup` again.');

  step(3, 'Shared database details (ask Hicham for these two values)');
  const prompt = createPrompter();
  let databaseUrl = null;
  for (let tries = 0; !databaseUrl && tries < 3; tries++) {
    databaseUrl = cleanDatabaseUrl(await prompt.ask('  Paste DATABASE_URL: '));
    if (!databaseUrl) console.log(red('  That does not look like a postgresql://... connection string. Try again.'));
  }
  let encryptionKey = null;
  for (let tries = 0; !encryptionKey && tries < 3; tries++) {
    encryptionKey = cleanKey(await prompt.ask('  Paste ENCRYPTION_KEY: '));
    if (!encryptionKey) console.log(red('  The key must be exactly 64 characters of 0-9 and a-f. Try again.'));
  }
  prompt.close();
  if (!databaseUrl || !encryptionKey) fail('Missing values. Run `npm run setup` again when you have them.');

  step(4, 'Writing server/.env');
  writeEnv(databaseUrl, encryptionKey);
  console.log(`  server/.env created ${green('OK')} (it is ignored by git - never commit it)`);

  step(5, 'Connecting to the shared database');
  if (!run('npx prisma generate', SERVER)) {
    // On Windows a running API server locks the Prisma engine file. npm install already
    // generated the client, so carry on if it exists.
    const generated = path.join(ROOT, 'node_modules', '.prisma', 'client', 'index.js');
    if (!fs.existsSync(generated)) fail('Could not generate the Prisma client. Close any running `npm run dev:server` and run `npm run setup` again.');
    console.log('  (Prisma files are in use, probably by a running API server - using the existing ones.)');
  }
  const db = checkDatabase();
  if (!db.ok) fail(`Could not reach the database: ${db.err}\n  Check that you pasted the full DATABASE_URL.`);
  console.log(`  Connected ${green('OK')} - ${db.out}`);

  console.log(`
${green(bold('All set!'))}

  Start the API:      npm run dev:server   -> http://localhost:4000/api/v1/health
  Start the website:  npm run dev:client   -> http://localhost:5173

  Rules: do not run the seed or migrations on the shared database unless the team agrees.
`);
}

main().catch((err) => fail(err.message));
