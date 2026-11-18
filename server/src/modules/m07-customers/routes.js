// M7 Customers routes. Mounted under /api/v1.
// Planned resources: /customers
// eslint-disable-next-line no-unused-vars
const { Roles, requireAuth, requireRole } = require('../../middleware/auth');
const express = require('express');

const router = express.Router();

module.exports = router;
