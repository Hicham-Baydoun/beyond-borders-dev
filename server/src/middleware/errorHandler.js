const { AppError } = require('../lib/errors');

function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'This address does not exist.' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on our side. Please try again in a moment.' });
}

module.exports = { notFoundHandler, errorHandler };
