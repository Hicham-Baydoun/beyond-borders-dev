// All business code must read time from here, never `new Date()` directly,
// so testers can move the staging clock (SRS Section 9.2).
const env = require('../config/env');
const { badRequest } = require('./errors');

// Allowed range for a moved clock. Wide enough for any booking scenario, narrow enough that
// the time stays valid as it keeps running after it is set.
const MIN_TIME = Date.UTC(2000, 0, 1);
const MAX_TIME = Date.UTC(2100, 0, 1);

let offsetMs = 0;

function now() {
  return new Date(Date.now() + offsetMs);
}

function setNow(date) {
  if (!env.ALLOW_CLOCK_CONTROL) throw new Error('Clock control is disabled');
  const target = new Date(date).getTime();
  if (Number.isNaN(target) || target < MIN_TIME || target >= MAX_TIME) {
    // The old offset is kept, so a bad request never leaves the clock half-changed.
    throw badRequest('The clock time is not valid. Send an ISO date between 2000 and 2099, for example 2027-06-01T09:00:00Z.');
  }
  offsetMs = target - Date.now();
}

function reset() {
  offsetMs = 0;
}

module.exports = { now, setNow, reset };
