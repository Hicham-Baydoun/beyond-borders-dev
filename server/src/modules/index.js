// Registry of the twelve server modules (SRS Section 5.4, Table 7).
// Rules (Section 5.4):
//   1. A module reads and writes only its own tables; it calls other modules through their service.js.
//   2. Side effects (emails, audit entries) are triggered by events (lib/eventBus.js).
//   3. Every module has: routes.js, controller.js, service.js, repository.js, README.md, __tests__/.
module.exports = [
  require('./m01-accounts'),
  require('./m02-catalog'),
  require('./m03-search'),
  require('./m04-booking'),
  require('./m05-payment'),
  require('./m06-documents'),
  require('./m07-customers'),
  require('./m08-notification'),
  require('./m09-reviews'),
  require('./m10-reports'),
  require('./m11-admin'),
  require('./m12-scheduler'),
];
