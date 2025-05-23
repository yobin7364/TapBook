export function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500
  const payload = {
    success: false,
    error: {
      message: err.message || 'Server Error',
    },
  }
  if (err.details) {
    payload.error.details = err.details
  }
  res.status(status).json(payload)
}
