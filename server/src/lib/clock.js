// All business code must read time from here, never `new Date()` directly,
// so testers can move the staging clock (SRS Section 9.2).
const env = require('../config/env');

let offsetMs = 0;

function now() {
  return new Date(Date.now() + offsetMs);
}

function setNow(date) {
  if (!env.ALLOW_CLOCK_CONTROL) throw new Error('Clock control is disabled');
  offsetMs = new Date(date).getTime() - Date.now();
}

function reset() {
  offsetMs = 0;
}

module.exports = { now, setNow, reset };
