// Role checks on every API route (FR-ACC-04). React route guards only hide pages;
// this is the real access control.
//
// After login, M1 sets: req.session.user = { kind: 'CUSTOMER' | 'STAFF', id, role, name }
// where role is 'CUSTOMER', 'AGENT' or 'ADMINISTRATOR'.
const { unauthorized, forbidden } = require('../lib/errors');

const Roles = Object.freeze({
  CUSTOMER: 'CUSTOMER',
  AGENT: 'AGENT',
  ADMINISTRATOR: 'ADMINISTRATOR',
});

function requireAuth(req, _res, next) {
  if (!req.session?.user) return next(unauthorized());
  next();
}

// Usage: router.get('/x', requireRole(Roles.AGENT, Roles.ADMINISTRATOR), handler)
function requireRole(...allowed) {
  return function requireRoleCheck(req, _res, next) {
    const user = req.session?.user;
    if (!user) return next(unauthorized());
    if (!allowed.includes(user.role)) return next(forbidden('Your role cannot use this function. Ask an administrator if you need access.'));
    next();
  };
}

// Marks a route as open to visitors on purpose. Every route needs requireAuth, requireRole or
// publicRoute; tests/routeGuards.test.js fails the build otherwise (FR-ACC-04).
function publicRoute(_req, _res, next) {
  next();
}

module.exports = { Roles, requireAuth, requireRole, publicRoute };
