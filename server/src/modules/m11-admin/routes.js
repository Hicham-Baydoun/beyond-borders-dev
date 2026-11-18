// M11 Administration and Audit routes. Mounted under /api/v1.
// Planned resources: /admin
// eslint-disable-next-line no-unused-vars
const { Roles, requireAuth, requireRole } = require('../../middleware/auth');
const express = require('express');

const router = express.Router();

module.exports = router;
