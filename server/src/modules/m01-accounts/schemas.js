// M1 request schemas (Zod). Unknown fields are stripped, so a visitor can never send `role` (TC-ACC-01-04).
const { z } = require('zod');

const email = z
  .string({ required_error: 'Enter your email address.' })
  .trim()
  .toLowerCase()
  .email('Enter a valid email address, for example name@example.com.');

// FR-ACC-01: at least 8 characters, with at least one letter and one digit.
const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
const newPassword = z
  .string({ required_error: 'Choose a password.' })
  .max(128, 'Use a password of at most 128 characters.')
  .regex(PASSWORD_RULE, 'Use at least 8 characters, with at least one letter and one digit.');

const register = z.object({
  fullName: z.string({ required_error: 'Enter your full name.' }).trim().min(2, 'Enter your full name.').max(120),
  email,
  phone: z
    .string({ required_error: 'Enter your phone number.' })
    .trim()
    .regex(/^\+?[\d\s()-]{7,20}$/, 'Enter a valid phone number, for example +961 70 123 456.'),
  password: newPassword,
});

const login = z.object({
  email,
  password: z.string({ required_error: 'Enter your password.' }).min(1, 'Enter your password.').max(128),
});

const token = z.object({ token: z.string().min(10).max(200) });

const resend = z.object({ email });

module.exports = { register, login, token, resend, PASSWORD_RULE };
