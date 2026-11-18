// Seed data from SRS Table 33. All people and numbers are made up for testing.
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();
const hash = (pw) => bcrypt.hash(pw, 12);
const d = (s) => new Date(`${s}T00:00:00Z`);

async function main() {
  await prisma.staffUser.upsert({
    where: { email: 'fadi.aoun@bbtravel.test' },
    update: {},
    create: { fullName: 'Fadi Aoun', email: 'fadi.aoun@bbtravel.test', role: 'ADMINISTRATOR', passwordHash: await hash('Admin#2027') },
  });
  await prisma.staffUser.upsert({
    where: { email: 'nour.saleh@bbtravel.test' },
    update: {},
    create: { fullName: 'Nour Saleh', email: 'nour.saleh@bbtravel.test', role: 'AGENT', passwordHash: await hash('Agent#2027') },
  });

  const customers = [
    { fullName: 'Rana Khoury', email: 'rana.khoury@example.com', phone: '+961 70 123 456', pw: 'Travel2027' },
    { fullName: 'Karim Haddad', email: 'karim.haddad@example.com', phone: '+961 76 840 312', pw: 'Haddad2027' },
  ];
  for (const c of customers) {
    await prisma.customer.upsert({
      where: { email: c.email },
      update: {},
      create: {
        fullName: c.fullName, email: c.email, phone: c.phone,
        phoneDigits: c.phone.replace(/\D/g, ''), status: 'ACTIVE', passwordHash: await hash(c.pw),
      },
    });
  }

  if ((await prisma.destination.count()) === 0) {
    const catalog = [
      { dest: ['Istanbul', 'Turkey'], title: 'Istanbul City Break', days: 5, price: 650, dep: ['2027-06-12', '2027-06-16', 20] },
      { dest: ['Antalya', 'Turkey'], title: 'Antalya Beach Holiday', days: 7, price: 890, dep: ['2027-07-03', '2027-07-09', 30] },
      { dest: ['Paris', 'France'], title: 'Paris and Normandy', days: 8, price: 1450, dep: ['2027-09-10', '2027-09-17', 12] },
      { dest: ['Dubai', 'United Arab Emirates'], title: 'Dubai Getaway', days: 4, price: 720, dep: ['2027-04-15', '2027-04-18', 10] },
    ];
    for (const p of catalog) {
      await prisma.destination.create({
        data: {
          name: p.dest[0], country: p.dest[1], description: `Trips to ${p.dest[0]}.`,
          packages: {
            create: {
              title: p.title, description: `${p.title} package.`, durationDays: p.days,
              pricePerPerson: p.price, includedServices: 'Return flights, hotel, airport transfers',
              departures: { create: { departureDate: d(p.dep[0]), returnDate: d(p.dep[1]), totalPlaces: p.dep[2] } },
            },
          },
        },
      });
    }
  }

  // Cancellation policy, SRS Table 20
  if ((await prisma.cancellationRule.count()) === 0) {
    const validFrom = new Date('2026-01-01T00:00:00Z');
    await prisma.cancellationRule.createMany({
      data: [
        { minDaysBefore: 30, maxDaysBefore: null, refundPercent: 90, validFrom },
        { minDaysBefore: 15, maxDaysBefore: 29, refundPercent: 50, validFrom },
        { minDaysBefore: 0, maxDaysBefore: 14, refundPercent: 0, validFrom },
      ],
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
