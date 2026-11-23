// M1 Accounts: SRS 9.5.1 test cases for FR-ACC-01, FR-ACC-02 and FR-ACC-03.
// Runs against the local bbtms_test database (never the shared one).
const request = require('supertest');
const bcrypt = require('bcryptjs');
const { createApp } = require('../../../app');
const prisma = require('../../../lib/prisma');
const clock = require('../../../lib/clock');
const mailer = require('../../../lib/mailer');

const app = createApp();
const DOMAIN = '@m01.test';
const PW = 'Travel2027';

const valid = (over = {}) => ({
  fullName: 'Test Customer',
  email: `user${Math.random().toString(36).slice(2, 8)}${DOMAIN}`,
  phone: '+961 70 123 456',
  password: PW,
  ...over,
});

async function cleanup() {
  await prisma.authToken.deleteMany({ where: { OR: [{ customer: { email: { endsWith: DOMAIN } } }, { staff: { email: { endsWith: DOMAIN } } }] } });
  await prisma.customer.deleteMany({ where: { email: { endsWith: DOMAIN } } });
  await prisma.staffUser.deleteMany({ where: { email: { endsWith: DOMAIN } } });
}

const tokenFromLastEmail = () => {
  const text = mailer.sent.at(-1).text;
  return decodeURIComponent(text.match(/token=([^\s]+)/)[1]);
};

async function activeCustomer(over = {}) {
  return prisma.customer.create({
    data: {
      fullName: 'Active Customer', email: `active${Math.random().toString(36).slice(2, 8)}${DOMAIN}`,
      phone: '+961 1', phoneDigits: '9611', status: 'ACTIVE', passwordHash: await bcrypt.hash(PW, 4), ...over,
    },
  });
}

beforeAll(cleanup);
afterEach(() => clock.reset());
afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe('FR-ACC-01 registration', () => {
  test('TC-ACC-01-01 valid details create an Unconfirmed customer and send an email', async () => {
    const body = valid();
    const before = mailer.sent.length;
    const res = await request(app).post('/api/v1/auth/register').send(body);
    expect(res.status).toBe(201);
    const row = await prisma.customer.findUnique({ where: { email: body.email } });
    expect(row.status).toBe('UNCONFIRMED');
    expect(row.passwordHash).not.toBe(PW);
    expect(row.phoneDigits).toBe('96170123456');
    expect(mailer.sent.length).toBe(before + 1);
    expect(mailer.sent.at(-1).to).toBe(body.email);
  });

  test('email is trimmed and lower-cased', async () => {
    const body = valid();
    await request(app).post('/api/v1/auth/register').send({ ...body, email: `  ${body.email.toUpperCase()} ` }).expect(201);
    expect(await prisma.customer.count({ where: { email: body.email } })).toBe(1);
  });

  test('TC-ACC-01-02 a used email gives 409 and no second row', async () => {
    const body = valid();
    await request(app).post('/api/v1/auth/register').send(body).expect(201);
    const res = await request(app).post('/api/v1/auth/register').send({ ...body, fullName: 'Someone Else' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/already exists/);
    expect(await prisma.customer.count({ where: { email: body.email } })).toBe(1);
  });

  test.each([
    ['abc1234', 400],
    ['abcdefgh', 400],
    ['12345678', 400],
    ['abcdefg1', 201],
  ])('TC-ACC-01-03 password %s gives %i', async (password, status) => {
    const res = await request(app).post('/api/v1/auth/register').send(valid({ password }));
    expect(res.status).toBe(status);
    if (status === 400) expect(res.body.details.password).toBeDefined();
  });

  test('a phone number without digits is rejected', async () => {
    const res = await request(app).post('/api/v1/auth/register').send(valid({ phone: '-------' }));
    expect(res.status).toBe(400);
    expect(res.body.details.phone).toBeDefined();
  });

  test('TC-ACC-01-04 an extra role field never creates staff', async () => {
    const body = valid();
    const staffBefore = await prisma.staffUser.count();
    await request(app).post('/api/v1/auth/register').send({ ...body, role: 'ADMINISTRATOR' }).expect(201);
    expect(await prisma.staffUser.count()).toBe(staffBefore);
    expect(await prisma.staffUser.findUnique({ where: { email: body.email } })).toBeNull();
  });
});

describe('FR-ACC-02 email confirmation', () => {
  test('TC-ACC-02-01 login is refused before confirming, works after', async () => {
    const body = valid();
    await request(app).post('/api/v1/auth/register').send(body).expect(201);
    const token = tokenFromLastEmail();

    const early = await request(app).post('/api/v1/auth/login').send({ email: body.email, password: PW });
    expect(early.status).toBe(403);
    expect(early.body.details.code).toBe('UNCONFIRMED');

    await request(app).post('/api/v1/auth/confirm').send({ token }).expect(200);
    const row = await prisma.customer.findUnique({ where: { email: body.email } });
    expect(row.status).toBe('ACTIVE');
    await request(app).post('/api/v1/auth/login').send({ email: body.email, password: PW }).expect(200);
  });

  test('TC-ACC-02-02 the link expires after 24 h; a new link works', async () => {
    const body = valid();
    await request(app).post('/api/v1/auth/register').send(body).expect(201);
    const oldToken = tokenFromLastEmail();

    clock.setNow(new Date(Date.now() + (24 * 60 + 1) * 60_000));
    const res = await request(app).post('/api/v1/auth/confirm').send({ token: oldToken });
    expect(res.status).toBe(410);
    expect((await prisma.customer.findUnique({ where: { email: body.email } })).status).toBe('UNCONFIRMED');

    await request(app).post('/api/v1/auth/confirm/resend').send({ email: body.email }).expect(200);
    await request(app).post('/api/v1/auth/confirm').send({ token: tokenFromLastEmail() }).expect(200);
    expect((await prisma.customer.findUnique({ where: { email: body.email } })).status).toBe('ACTIVE');
  });

  test('TC-ACC-02-03 using a link twice says already used', async () => {
    await request(app).post('/api/v1/auth/register').send(valid()).expect(201);
    const token = tokenFromLastEmail();
    await request(app).post('/api/v1/auth/confirm').send({ token }).expect(200);
    const again = await request(app).post('/api/v1/auth/confirm').send({ token });
    expect(again.status).toBe(409);
    expect(again.body.error).toMatch(/already been used/);
  });

  test('two simultaneous uses of one link: exactly one succeeds', async () => {
    const body = valid();
    await request(app).post('/api/v1/auth/register').send(body).expect(201);
    const token = tokenFromLastEmail();
    const [a, b] = await Promise.all([
      request(app).post('/api/v1/auth/confirm').send({ token }),
      request(app).post('/api/v1/auth/confirm').send({ token }),
    ]);
    expect([a.status, b.status].sort()).toEqual([200, 409]);
    expect((await prisma.customer.findUnique({ where: { email: body.email } })).status).toBe('ACTIVE');
  });

  test('an old link never reactivates a deactivated account', async () => {
    const body = valid();
    await request(app).post('/api/v1/auth/register').send(body).expect(201);
    const token = tokenFromLastEmail();
    await prisma.customer.update({ where: { email: body.email }, data: { status: 'DEACTIVATED' } });
    await request(app).post('/api/v1/auth/confirm').send({ token }).expect(409);
    expect((await prisma.customer.findUnique({ where: { email: body.email } })).status).toBe('DEACTIVATED');
  });

  test('resend for an unknown email still answers 200 and sends nothing', async () => {
    const before = mailer.sent.length;
    await request(app).post('/api/v1/auth/confirm/resend').send({ email: `nobody${DOMAIN}` }).expect(200);
    expect(mailer.sent.length).toBe(before);
  });

  test('a made-up token gives 400', async () => {
    await request(app).post('/api/v1/auth/confirm').send({ token: 'x'.repeat(43) }).expect(400);
  });
});

describe('FR-ACC-03 login, logout and lockout', () => {
  test('TC-ACC-03-01 customer, agent and admin log in with their role; /auth/me and logout work', async () => {
    const customer = await activeCustomer();
    const hash = await bcrypt.hash(PW, 4);
    const agent = await prisma.staffUser.create({ data: { fullName: 'Agent', email: `agent${DOMAIN}`, role: 'AGENT', passwordHash: hash } });
    const admin = await prisma.staffUser.create({ data: { fullName: 'Admin', email: `admin${DOMAIN}`, role: 'ADMINISTRATOR', passwordHash: hash } });

    for (const [email, role] of [[customer.email, 'CUSTOMER'], [agent.email, 'AGENT'], [admin.email, 'ADMINISTRATOR']]) {
      const agentClient = request.agent(app);
      const res = await agentClient.post('/api/v1/auth/login').send({ email, password: PW });
      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe(role);
      const me = await agentClient.get('/api/v1/auth/me').expect(200);
      expect(me.body.user.email).toBe(email);
      await agentClient.post('/api/v1/auth/logout').expect(204);
      await agentClient.get('/api/v1/auth/me').expect(401);
    }
  });

  test('unknown email and wrong password give the same message', async () => {
    const c = await activeCustomer();
    const a = await request(app).post('/api/v1/auth/login').send({ email: `ghost${DOMAIN}`, password: PW });
    const b = await request(app).post('/api/v1/auth/login').send({ email: c.email, password: 'Wrong1234' });
    expect(a.status).toBe(401);
    expect(b.status).toBe(401);
    expect(a.body.error).toBe(b.body.error);
  });

  test('TC-ACC-03-02 locked on the 5th failure for 15 minutes', async () => {
    const c = await activeCustomer();
    const t0 = new Date('2027-03-01T10:00:00Z');
    clock.setNow(t0);
    const tryLogin = (password) => request(app).post('/api/v1/auth/login').send({ email: c.email, password });

    for (let i = 0; i < 4; i++) expect((await tryLogin('Wrong1234')).status).toBe(401);
    expect((await prisma.customer.findUnique({ where: { id: c.id } })).lockedUntil).toBeNull();

    expect((await tryLogin('Wrong1234')).status).toBe(423);

    clock.setNow(new Date('2027-03-01T10:14:00Z'));
    const stillLocked = await tryLogin(PW);
    expect(stillLocked.status).toBe(423);
    expect(stillLocked.body.error).toMatch(/locked for 15 minutes/);

    clock.setNow(new Date('2027-03-01T10:16:00Z'));
    expect((await tryLogin(PW)).status).toBe(200);
    const row = await prisma.customer.findUnique({ where: { id: c.id } });
    expect(row.failedLoginCount).toBe(0);
    expect(row.lockedUntil).toBeNull();
  });

  test('TC-ACC-03-03 a success resets the count', async () => {
    const c = await activeCustomer();
    const tryLogin = (password) => request(app).post('/api/v1/auth/login').send({ email: c.email, password });
    for (let i = 0; i < 3; i++) await tryLogin('Wrong1234');
    expect((await tryLogin(PW)).status).toBe(200);
    for (let i = 0; i < 4; i++) expect((await tryLogin('Wrong1234')).status).toBe(401);
    expect((await prisma.customer.findUnique({ where: { id: c.id } })).lockedUntil).toBeNull();
  });

  test('a deactivated account cannot log in', async () => {
    const c = await activeCustomer({ status: 'DEACTIVATED' });
    const res = await request(app).post('/api/v1/auth/login').send({ email: c.email, password: PW });
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/deactivated/);
  });

  test('login gives a new session id (no session fixation)', async () => {
    const c = await activeCustomer();
    const client = request.agent(app);
    const first = await client.post('/api/v1/auth/login').send({ email: c.email, password: PW });
    const second = await client.post('/api/v1/auth/login').send({ email: c.email, password: PW });
    const sid = (r) => r.headers['set-cookie'].find((x) => x.startsWith('bbtms.sid=')).split(';')[0];
    expect(sid(first)).not.toBe(sid(second));
  });
});
