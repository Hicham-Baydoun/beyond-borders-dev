// Internal event bus between modules (SRS Section 5.4, Table 9).
// Side effects such as emails and audit entries listen here instead of being called directly.
const { EventEmitter } = require('events');

const bus = new EventEmitter();
bus.setMaxListeners(50);

// Event names used across modules. Add new ones here so they stay in one place.
const Events = Object.freeze({
  BOOKING_CREATED: 'booking.created',
  BOOKING_CONFIRMED: 'booking.confirmed',
  BOOKING_CANCELLED: 'booking.cancelled',
  BOOKING_EXPIRED: 'booking.expired',
  PAYMENT_RECEIVED: 'payment.received',
  REFUND_COMPLETED: 'refund.completed',
  REFUND_FAILED: 'refund.failed',
  DOCUMENT_ATTACHED: 'document.attached',
  DEPARTURE_CANCELLED: 'departure.cancelled',
});

// Listener errors must never break the request that emitted the event.
function on(event, handler) {
  bus.on(event, async (payload) => {
    try {
      await handler(payload);
    } catch (err) {
      console.error(`Listener for ${event} failed:`, err);
    }
  });
}

function emit(event, payload) {
  bus.emit(event, payload);
}

module.exports = { Events, on, emit };
