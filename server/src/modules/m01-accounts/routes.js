// M1 Accounts and Access routes. Mounted under /api/v1.
// Planned resources: /auth, /staff
// eslint-disable-next-line no-unused-vars
const { Roles, requireAuth, requireRole } = require('../../middleware/auth');
const express = require('express');

const router = express.Router();

module.exports = router;
