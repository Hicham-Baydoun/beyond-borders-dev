// Errors that map to HTTP status codes (SRS Section 5.5).
// Every message must say what went wrong and what to do next (Section 6.6).
class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const badRequest = (msg, details) => new AppError(400, msg, details);
const unauthorized = (msg = 'Please log in to continue.') => new AppError(401, msg);
const forbidden = (msg = 'Your account does not have permission for this action. Ask an administrator if you need access.') =>
  new AppError(403, msg);
const notFound = (msg = 'We could not find what you asked for. Check the link or go back and try again.') =>
  new AppError(404, msg);
const conflict = (msg, details) => new AppError(409, msg, details);

module.exports = { AppError, badRequest, unauthorized, forbidden, notFound, conflict };
