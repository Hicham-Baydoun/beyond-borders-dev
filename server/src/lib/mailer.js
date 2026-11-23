// Small mail adapter used until the M8 outbox exists (KAN-21). M8 will replace send() with an outbox write.
// Development: Mailpit on SMTP_HOST:SMTP_PORT (inbox at http://localhost:8025).
// Tests: messages are kept in memory (mailer.sent) instead of being sent.
const nodemailer = require('nodemailer');
const env = require('../config/env');

const sent = [];

const transport =
  env.NODE_ENV === 'test'
    ? null
    : nodemailer.createTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, secure: false, ignoreTLS: env.SMTP_HOST === 'localhost' });

// Never throws: a mail failure must not undo a registration. The caller can offer "send a new link".
async function send({ to, subject, text, html }) {
  const message = { from: env.MAIL_FROM, to, subject, text, html };
  if (!transport) {
    sent.push(message);
    return true;
  }
  try {
    await transport.sendMail(message);
    return true;
  } catch (err) {
    console.error('Email could not be sent', { to, subject, code: err?.code });
    return false;
  }
}

module.exports = { send, sent };
