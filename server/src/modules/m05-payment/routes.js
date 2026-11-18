// M5 Payment and Refund routes. Mounted under /api/v1.
// Planned resources: /payments, /payments/webhook
// eslint-disable-next-line no-unused-vars
const { Roles, requireAuth, requireRole } = require('../../middleware/auth');
const express = require('express');

const router = express.Router();

module.exports = router;
