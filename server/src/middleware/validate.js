const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

// Drop this in after a chain of express-validator checks; throws a 422 with
// the full list of validation failures if any check failed.
function validate(req, _res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  next(new ApiError(422, 'Validation failed', result.array()));
}

module.exports = validate;
