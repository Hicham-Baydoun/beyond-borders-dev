// Validates req.body / req.query / req.params with a Zod schema.
// Usage: router.post('/', validate({ body: schema }), handler)
const { badRequest } = require('../lib/errors');

function validate(schemas) {
  return (req, _res, next) => {
    for (const part of ['body', 'query', 'params']) {
      if (!schemas[part]) continue;
      const result = schemas[part].safeParse(req[part]);
      if (!result.success) {
        return next(badRequest('Some fields are not valid. Please correct them and try again.', result.error.flatten().fieldErrors));
      }
      req[part] = result.data;
    }
    next();
  };
}

module.exports = validate;
