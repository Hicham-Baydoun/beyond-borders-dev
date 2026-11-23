// Shared validation schemas (KAN-83). CommonJS so the Node server can require() it;
// Vite converts it for the browser (see client/vite.config.js).
module.exports = {
  ...require('./schemas/auth'),
};
