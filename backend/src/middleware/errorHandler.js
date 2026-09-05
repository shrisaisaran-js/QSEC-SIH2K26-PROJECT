/** Small typed error for controllers to throw with an explicit HTTP status. */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

/** Wrap an async route handler so rejected promises reach the error handler. */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: "NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} does not exist.`,
  });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || (err.name === "ValidationError" ? 400 : 500);
  const isServerError = statusCode >= 500;

  if (isServerError) {
    console.error("[error]", err);
  }

  res.status(statusCode).json({
    success: false,
    error: err.name || "INTERNAL_ERROR",
    message: isServerError && process.env.NODE_ENV === "production"
      ? "An unexpected error occurred."
      : err.message,
    ...(err.details ? { details: err.details } : {}),
  });
}

module.exports = { ApiError, asyncHandler, notFoundHandler, errorHandler };
