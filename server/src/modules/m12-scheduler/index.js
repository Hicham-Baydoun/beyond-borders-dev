// M12 has no routes: it runs the timed jobs of SRS Section 5.4.
// Each job calls the owning module's service (M4, M8); the scheduler holds no business rules.
const cron = require('node-cron');
const env = require('../../config/env');

const jobs = [
  { name: 'expire-holds', schedule: '* * * * *', run: async () => {} }, // FR-BKG-08 -> M4
  { name: 'retry-emails', schedule: '*/10 * * * *', run: async () => {} }, // Table 27 -> M8
  { name: 'complete-bookings', schedule: '5 0 * * *', run: async () => {} }, // FR-BKG-09 -> M4
  { name: 'send-reminders', schedule: '0 8 * * *', run: async () => {} }, // FR-NOT-04 -> M8
];

async function runJob(job) {
  try {
    await job.run();
  } catch (err) {
    console.error(`Job ${job.name} failed:`, err);
  }
}

module.exports = {
  name: 'M12 Scheduler',
  jobs,
  runJob, // exposed so tests can run a job on demand ("run the daily job")
  register() {
    if (env.NODE_ENV === 'test') return;
    for (const job of jobs) cron.schedule(job.schedule, () => runJob(job));
  },
};
