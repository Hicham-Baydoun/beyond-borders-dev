// M1 Accounts and Access routes. Mounted under /api/v1.
// /auth now; /staff comes with FR-ACC-06.
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const env = require('../../config/env');
const { Roles, publicRoute, requireRole } = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const schemas = require('./schemas');
const controller = require('./controller');

const router = express.Router();

// Stricter limit for the endpoints people could brute-force or use to send spam emails.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  handler: (_req, res) =>
    res.status(429).json({ error: 'Too many attempts from your network. Wait 15 minutes, then try again.' }),
});

router.post('/auth/register', publicRoute, authLimiter, validate({ body: schemas.register }), controller.register);
router.post('/auth/confirm', publicRoute, validate({ body: schemas.token }), controller.confirm);
router.post('/auth/confirm/resend', publicRoute, authLimiter, validate({ body: schemas.resend }), controller.resend);
router.post('/auth/login', publicRoute, authLimiter, validate({ body: schemas.login }), controller.login);
router.post('/auth/logout', publicRoute, controller.logout);
router.get('/auth/me', requireRole(Roles.CUSTOMER, Roles.AGENT, Roles.ADMINISTRATOR), controller.me);

module.exports = router;
