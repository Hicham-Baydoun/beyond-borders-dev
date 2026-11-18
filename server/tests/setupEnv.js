// Safe defaults so tests run without a real .env file.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ||= 'postgresql://bbtms:bbtms@localhost:5432/bbtms_test';
process.env.SESSION_SECRET ||= 'test-secret-test-secret-test-secret-1234';
process.env.ENCRYPTION_KEY ||= '0'.repeat(64);
process.env.ALLOW_CLOCK_CONTROL = 'true';
