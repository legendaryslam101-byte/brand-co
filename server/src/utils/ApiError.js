// A typed error carrying an HTTP status code, so route handlers can
// `throw new ApiError(404, 'Product not found')` and the central error
// handler renders the right response without any special-casing.
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

module.exports = ApiError;
