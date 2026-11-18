// M8 has no routes: it listens to events (Table 9) and writes to the email outbox.
module.exports = {
  name: 'M8 Notification',
  register() {
    // Subscribe to booking, payment, refund, document and departure events here, e.g.:
    // const { on, Events } = require('../../lib/eventBus');
    // on(Events.BOOKING_CONFIRMED, service.queueConfirmationEmail);
  },
};
