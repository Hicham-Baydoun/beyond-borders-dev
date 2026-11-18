// Single shared Prisma client. Modules access it only through their own repository files.
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = prisma;
