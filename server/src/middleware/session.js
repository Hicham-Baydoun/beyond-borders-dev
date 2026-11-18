// Server-side sessions stored in PostgreSQL with a 30-minute idle timeout (NFR-SEC-04).
const session = require('express-session');
const PgStore = require('connect-pg-simple')(session);
const env = require('../config/env');

const THIRTY_MINUTES = 30 * 60 * 1000;

module.exports = session({
  // Tests use the in-memory store so they do not need a database connection.
  store: env.NODE_ENV === 'test' ? undefined : new PgStore({
    conString: env.DATABASE_URL,
    tableName: 'user_session',
    createTableIfMissing: true,
  }),
  name: 'bbtms.sid',
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true, // every request restarts the idle timer
  cookie: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production', // HTTPS only in production (NFR-SEC-01)
    sameSite: 'lax',
    maxAge: THIRTY_MINUTES,
  },
});
