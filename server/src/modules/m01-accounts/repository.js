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

const createToken = (data) => prisma.authToken.create({ data });
const findToken = (tokenHash) => prisma.authToken.findUnique({ where: { tokenHash } });

// Uses the token and activates the customer in one transaction (FR-ACC-02).
// The usedAt: null condition makes a second, simultaneous use fail instead of activating twice.
async function useConfirmToken(tokenId, customerId, now) {
  return prisma.$transaction(async (tx) => {
    const { count } = await tx.authToken.updateMany({ where: { id: tokenId, usedAt: null }, data: { usedAt: now } });
    if (count === 0) return false;
    await tx.customer.update({ where: { id: customerId }, data: { status: 'ACTIVE' } });
    return true;
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
  createToken,
  findToken,
  useConfirmToken,
};
