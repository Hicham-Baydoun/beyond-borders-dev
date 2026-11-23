// M1 Accounts and Access: business rules. Other modules call these functions, never the repository.
// FR-ACC-01 registration, FR-ACC-02 email confirmation, FR-ACC-03 login and lockout.
const bcrypt = require('bcryptjs');
const env = require('../../config/env');
const clock = require('../../lib/clock');
const { newToken, hashToken } = require('../../lib/crypto');
const mailer = require('../../lib/mailer');
const { Events, emit } = require('../../lib/eventBus');
const { badRequest, unauthorized, forbidden, conflict, gone, locked } = require('../../lib/errors');
const repo = require('./repository');

const BCRYPT_COST = 12;
const MAX_FAILED_LOGINS = 5;
const LOCK_MINUTES = 15;
const CONFIRM_HOURS = 24;

const MSG = {
  duplicate: 'An account with this email already exists. Log in or reset your password.',
  wrongLogin: 'Wrong email or password.',
  locked: `Your account is locked for ${LOCK_MINUTES} minutes because of too many failed attempts. Try again later or reset your password.`,
  unconfirmed: 'Please confirm your email address first. We can send you a new link.',
  deactivated: 'This account has been deactivated. Contact your administrator.',
  badLink: 'This confirmation link is not valid. Check that you copied the whole link, or request a new one.',
  usedLink: 'This link has already been used. You can log in now.',
  expiredLink: 'This link has expired. Request a new confirmation email.',
};

// Compared against when the email is unknown, so a wrong email takes as long as a wrong password.
let dummyHash;
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash('not-a-real-password-1', BCRYPT_COST));

const addMinutes = (date, m) => new Date(date.getTime() + m * 60_000);

// Shape stored in the session and returned by /auth/me. role: CUSTOMER | AGENT | ADMINISTRATOR.
function sessionUser(kind, account) {
  return {
    kind,
    id: account.id,
    role: kind === 'STAFF' ? account.role : 'CUSTOMER',
    name: account.fullName,
    email: account.email,
  };
}

// Emails are unique across customers and staff (FR-ACC-03 lookup order: staff first).
async function findAccountByEmail(email) {
  const staff = await repo.findStaffByEmail(email);
  if (staff) return { kind: 'STAFF', account: staff };
  const customer = await repo.findCustomerByEmail(email);
  if (customer) return { kind: 'CUSTOMER', account: customer };
  return null;
}

async function sendConfirmation(customer) {
  const { token, tokenHash } = newToken();
  await repo.createToken({
    purpose: 'CONFIRM_EMAIL',
    tokenHash,
    expiresAt: new Date(clock.now().getTime() + CONFIRM_HOURS * 3_600_000),
    customerId: customer.id,
  });
  const link = `${env.CLIENT_URL}/confirm?token=${encodeURIComponent(token)}`;
  if (env.NODE_ENV === 'development') console.log(`[dev] Confirmation link for ${customer.email}: ${link}`);
  await mailer.send({
    to: customer.email,
    subject: 'Confirm your Beyond Borders account',
    text: `Hello ${customer.fullName},\n\nConfirm your email address to activate your account:\n${link}\n\nThe link works once and expires in ${CONFIRM_HOURS} hours.\n\nBeyond Borders Travel`,
    html: `<p>Hello ${escapeHtml(customer.fullName)},</p><p>Confirm your email address to activate your account:</p><p><a href="${link}">Confirm my email</a></p><p>The link works once and expires in ${CONFIRM_HOURS} hours.</p><p>Beyond Borders Travel</p>`,
  });
}

const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// FR-ACC-01. Public registration only ever creates customers.
async function register({ fullName, email, phone, password }) {
  if (await findAccountByEmail(email)) throw conflict(MSG.duplicate);
  let customer;
  try {
    customer = await repo.createCustomer({
      fullName,
      email,
      phone,
      phoneDigits: phone.replace(/\D/g, ''),
      passwordHash: await bcrypt.hash(password, BCRYPT_COST),
      status: 'UNCONFIRMED',
    });
  } catch (err) {
    if (err?.code === 'P2002') throw conflict(MSG.duplicate); // two registrations at the same moment
    throw err;
  }
  await sendConfirmation(customer);
  emit(Events.CUSTOMER_REGISTERED, { customerId: customer.id });
  return { id: customer.id, email: customer.email, status: customer.status };
}

// FR-ACC-02
async function confirmEmail(token) {
  const record = await repo.findToken(hashToken(token));
  if (!record || record.purpose !== 'CONFIRM_EMAIL' || !record.customerId) throw badRequest(MSG.badLink);
  if (record.usedAt) throw conflict(MSG.usedLink);
  const now = clock.now();
  if (record.expiresAt <= now) throw gone(MSG.expiredLink);
  const ok = await repo.useConfirmToken(record.id, record.customerId, now);
  if (!ok) throw conflict(MSG.usedLink);
  emit(Events.CUSTOMER_CONFIRMED, { customerId: record.customerId });
}

// Always succeeds from the caller's view, so it never reveals which emails have accounts.
async function resendConfirmation(email) {
  const customer = await repo.findCustomerByEmail(email);
  if (customer && customer.status === 'UNCONFIRMED') await sendConfirmation(customer);
}

// FR-ACC-03. Returns the session user; the controller stores it in a fresh session.
async function login({ email, password }, meta = {}) {
  const found = await findAccountByEmail(email);
  if (!found) {
    await bcrypt.compare(password, await getDummyHash());
    emit(Events.LOGIN_FAILED, { email, reason: 'UNKNOWN_EMAIL', ...meta });
    throw unauthorized(MSG.wrongLogin);
  }
  const { kind, account } = found;
  const now = clock.now();

  if (account.lockedUntil && account.lockedUntil > now) {
    emit(Events.LOGIN_FAILED, { kind, id: account.id, reason: 'LOCKED', ...meta });
    throw locked(MSG.locked, { lockedUntil: account.lockedUntil });
  }

  const passwordOk = account.passwordHash ? await bcrypt.compare(password, account.passwordHash) : false;
  if (!passwordOk) {
    // A lock that has run out starts a fresh count.
    const base = account.lockedUntil ? await repo.updateAccount(kind, account.id, { failedLoginCount: 0, lockedUntil: null }) : account;
    const updated = await repo.addFailedLogin(kind, base.id);
    emit(Events.LOGIN_FAILED, { kind, id: account.id, reason: 'WRONG_PASSWORD', ...meta });
    if (updated.failedLoginCount >= MAX_FAILED_LOGINS) {
      const lockedUntil = addMinutes(now, LOCK_MINUTES);
      await repo.updateAccount(kind, account.id, { lockedUntil });
      emit(Events.ACCOUNT_LOCKED, { kind, id: account.id, lockedUntil, ...meta });
      throw locked(MSG.locked, { lockedUntil });
    }
    throw unauthorized(MSG.wrongLogin);
  }

  if (account.failedLoginCount !== 0 || account.lockedUntil) {
    await repo.updateAccount(kind, account.id, { failedLoginCount: 0, lockedUntil: null });
  }
  if (account.status === 'UNCONFIRMED') throw forbidden(MSG.unconfirmed, { code: 'UNCONFIRMED' });
  if (account.status === 'DEACTIVATED') throw forbidden(MSG.deactivated, { code: 'DEACTIVATED' });

  const user = sessionUser(kind, account);
  emit(Events.LOGIN_SUCCEEDED, { kind, id: account.id, ...meta });
  return user;
}

// Reloads the user so a deactivated account loses access on its next request.
async function getSessionUser(sessionData) {
  if (!sessionData) return null;
  const account =
    sessionData.kind === 'STAFF' ? await repo.findStaffById(sessionData.id) : await repo.findCustomerById(sessionData.id);
  if (!account || account.status !== 'ACTIVE') return null;
  return sessionUser(sessionData.kind, account);
}

module.exports = { register, confirmEmail, resendConfirmation, login, getSessionUser, MSG };
