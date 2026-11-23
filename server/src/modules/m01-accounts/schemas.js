// M1 request schemas. The definitions live in the shared package so the client forms use the same rules.
const { registerSchema, loginSchema, tokenSchema, emailOnlySchema } = require('@bb/shared');

module.exports = { register: registerSchema, login: loginSchema, token: tokenSchema, resend: emailOnlySchema };
