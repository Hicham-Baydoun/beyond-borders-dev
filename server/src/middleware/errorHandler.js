const { AppError } = require('../lib/errors');

function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'This address does not exist. Check the URL, or start again from the home page.' });
}

// Errors raised by express.json() before our code runs.
const bodyParserErrors = {
  'entity.parse.failed': [400, 'The request body is not valid JSON. Fix the format and send it again.'],
  'entity.too.large': [413, 'The request is too large. Send less data (the limit is 1 MB).'],
};

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  if (bodyParserErrors[err?.type]) {
    const [status, message] = bodyParserErrors[err.type];
    return res.status(status).json({ error: message });
  }
  // Log only safe fields: messages and stacks of parser errors can contain request data (passwords, passports).
  console.error('Unhandled error', { name: err?.name, type: err?.type, status: err?.status, code: err?.code });
  res.status(500).json({ error: 'Something went wrong on our side. Please try again in a moment.' });
}

module.exports = { notFoundHandler, errorHandler };
