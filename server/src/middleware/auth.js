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
  return (req, _res, next) => {
    const user = req.session?.user;
    if (!user) return next(unauthorized());
    if (!allowed.includes(user.role)) return next(forbidden());
    next();
  };
}

module.exports = { Roles, requireAuth, requireRole };
