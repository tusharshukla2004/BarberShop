/**
 * Standard API response envelope helper
 * Matches client expectations: res.data receives payload
 */
export function sendSuccess(res, data, statusCode = 200, message = null) {
  const payload = {
    success: true,
    data,
  };
  if (message) {
    payload.message = message;
  }
  return res.status(statusCode).json(payload);
}

export function sendError(res, statusCode, message, code = 'ERROR', details = null) {
  const payload = {
    success: false,
    error: {
      code,
      message,
    },
  };
  if (details) {
    payload.error.details = details;
  }
  return res.status(statusCode).json(payload);
}
