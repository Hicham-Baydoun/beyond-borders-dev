// M1 Accounts and Access: turns HTTP requests into service calls.
const service = require('./service');

const SESSION_COOKIE = 'bbtms.sid';

// Express 4 does not forward rejected promises, so every handler goes through this.
const handle = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);

const promisify = (fn) => new Promise((resolve, reject) => fn((err) => (err ? reject(err) : resolve())));

module.exports = {
  register: handle(async (req, res) => {
    const customer = await service.register(req.body);
    res.status(201).json({
      customer,
      message: 'Check your email to confirm your account. The link is valid for 24 hours.',
    });
  }),

  confirm: handle(async (req, res) => {
    await service.confirmEmail(req.body.token);
    res.json({ message: 'Your email is confirmed. You can log in now.' });
  }),

  resend: handle(async (req, res) => {
    await service.resendConfirmation(req.body.email);
    res.json({ message: 'If this email has an account waiting for confirmation, we sent a new link. Check your inbox.' });
  }),

  login: handle(async (req, res) => {
    const user = await service.login(req.body, { ip: req.ip });
    // A new session id after login prevents session fixation (FR-ACC-03).
    await promisify((cb) => req.session.regenerate(cb));
    req.session.user = { kind: user.kind, id: user.id, role: user.role, name: user.name };
    await promisify((cb) => req.session.save(cb));
    res.json({ user });
  }),

  logout: handle(async (req, res) => {
    if (req.session) await promisify((cb) => req.session.destroy(cb));
    res.clearCookie(SESSION_COOKIE);
    res.status(204).end();
  }),

  me: handle(async (req, res) => {
    const user = await service.getSessionUser(req.session?.user);
    if (!user) {
      if (req.session?.user) await promisify((cb) => req.session.destroy(cb));
      return res.status(401).json({ error: 'Please log in to continue.' });
    }
    res.json({ user });
  }),
};
