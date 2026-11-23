// KAN-83: a server-side field error must land under the right field. Run with `npm test -w client`.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mapServerErrors } from './formErrors.js';

const fields = ['fullName', 'email', 'phone', 'password'];

test('a 400 field error goes under its field, with no form-level message', () => {
  const err = { status: 400, message: 'Some fields are not valid.', details: { password: ['Use at least 8 characters, with at least one letter and one digit.'] } };
  const r = mapServerErrors(err, fields);
  assert.deepEqual(r.fields, { password: 'Use at least 8 characters, with at least one letter and one digit.' });
  assert.equal(r.form, null);
});

test('only the first message per field is shown', () => {
  const r = mapServerErrors({ status: 400, details: { email: ['First problem.', 'Second problem.'] } }, fields);
  assert.equal(r.fields.email, 'First problem.');
});

test('errors for fields not on the form become a form-level message', () => {
  const r = mapServerErrors({ status: 400, details: { role: ['Not allowed.'] } }, fields);
  assert.deepEqual(r.fields, {});
  assert.equal(r.form, 'Not allowed.');
});

test('non-validation errors become a form-level message', () => {
  const r = mapServerErrors({ status: 409, message: 'An account with this email already exists. Log in or reset your password.' }, fields);
  assert.equal(r.form, 'An account with this email already exists. Log in or reset your password.');
  assert.equal(r.retry, true);
});

test('a network failure still gives a helpful message', () => {
  assert.equal(mapServerErrors(undefined, fields).form, 'Something went wrong. Please try again.');
});
