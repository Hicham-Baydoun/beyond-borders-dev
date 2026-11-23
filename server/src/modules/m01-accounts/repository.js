// M1 Accounts and Access: database access through Prisma. Only this module's tables
// (customer, staff_user, auth_token).
const prisma = require('../../lib/prisma');

const findStaffByEmail = (email) => prisma.staffUser.findUnique({ where: { email } });
const findCustomerByEmail = (email) => prisma.customer.findUnique({ where: { email } });
const findStaffById = (id) => prisma.staffUser.findUnique({ where: { id } });
const findCustomerById = (id) => prisma.customer.findUnique({ where: { id } });

const createCustomer = (data) => prisma.customer.create({ data });

// kind: 'CUSTOMER' | 'STAFF'
function updateAccount(kind, id, data) {
  const table = kind === 'STAFF' ? prisma.staffUser : prisma.customer;
  return table.update({ where: { id }, data });
}

// Atomic increment, so two wrong passwords sent at the same moment both count.
function addFailedLogin(kind, id) {
  return updateAccount(kind, id, { failedLoginCount: { increment: 1 } });
}

const accounts = (kind) => (kind === 'STAFF' ? prisma.staffUser : prisma.customer);

// The lockout updates below are conditional, so concurrent logins cannot undo each other's lock.
// Clears an expired lock only if it is still the one we read.
const clearExpiredLock = (kind, id, expiredLock) =>
  accounts(kind).updateMany({ where: { id, lockedUntil: expiredLock }, data: { failedLoginCount: 0, lockedUntil: null } });

// Locks the account unless an active lock is already in place.
const lockUnlessLocked = (kind, id, lockedUntil, now) =>
  accounts(kind).updateMany({ where: { id, OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }] }, data: { lockedUntil } });

// After a correct password: reset the counter unless an active lock appeared meanwhile.
const resetLoginStateUnlessLocked = (kind, id, now) =>
  accounts(kind).updateMany({
    where: { id, OR: [{ lockedUntil: null }, { lockedUntil: { lte: now } }] },
    data: { failedLoginCount: 0, lockedUntil: null },
  });

const createToken = (data) => prisma.authToken.create({ data });
const findToken = (tokenHash) => prisma.authToken.findUnique({ where: { tokenHash } });

// Uses the token and activates the customer in one transaction (FR-ACC-02).
// - usedAt: null makes a second, simultaneous use fail instead of activating twice.
// - status: UNCONFIRMED means an old link can never reactivate a deactivated account.
// Returns 'ok', 'used' or 'not_unconfirmed'.
async function useConfirmToken(tokenId, customerId, now) {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.authToken.updateMany({ where: { id: tokenId, usedAt: null }, data: { usedAt: now } });
    if (count === 0) return 'used';
    const activated = await tx.customer.updateMany({ where: { id: customerId, status: 'UNCONFIRMED' }, data: { status: 'ACTIVE' } });
    return activated.count === 1 ? 'ok' : 'not_unconfirmed';
  });
}

module.exports = {
  findStaffByEmail,
  findCustomerByEmail,
  findStaffById,
  findCustomerById,
  createCustomer,
  updateAccount,
  addFailedLogin,
  clearExpiredLock,
  lockUnlessLocked,
  resetLoginStateUnlessLocked,
  createToken,
  findToken,
  useConfirmToken,
};
