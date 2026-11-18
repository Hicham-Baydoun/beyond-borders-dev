// Loads and validates environment variables once at startup.
require('dotenv').config();
const { z } = require('zod');

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Default only when unset; a blank or bad value fails at startup instead of becoming port 0.
  PORT: z
    .string()
    .regex(/^\d+$/, 'must be a whole number')
    .transform(Number)
    .pipe(z.number().int().min(1).max(65535))
    .default('4000'),
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().regex(/^[0-9a-fA-F]{64}$/, 'must be 64 hex characters'),
  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  MAIL_FROM: z.string().default('Beyond Borders <no-reply@bbtravel.test>'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  ALLOW_CLOCK_CONTROL: z.enum(['true', 'false']).default('false').transform((v) => v === 'true'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

if (parsed.data.NODE_ENV === 'production' && parsed.data.ALLOW_CLOCK_CONTROL) {
  console.error('ALLOW_CLOCK_CONTROL must be false in production.');
  process.exit(1);
}

module.exports = parsed.data;
