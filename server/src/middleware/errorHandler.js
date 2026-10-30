import { ZodError } from 'zod';
import { env } from '../config/env.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  if (env.NODE_ENV !== 'test') {
    console.error('Unhandled API Error:', err);
  }

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const formattedIssues = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: formattedIssues[0]?.message || 'Invalid input data',
        details: formattedIssues,
      },
    });
  }

  // 2. MongoDB Duplicate Key (Code 11000) - e.g. double booking or unique email
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const isBookingSlot =
      err.keyPattern?.barberId && err.keyPattern?.date && err.keyPattern?.startTime;

    const message = isBookingSlot
      ? 'This slot is already booked. Please choose an alternate slot or barber.'
      : `A record with this ${field} already exists.`;

    return res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message,
        details: err.keyValue,
      },
    });
  }

  // 3. Mongoose CastError (Invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_ID',
        message: `Invalid identifier: ${err.value}`,
      },
    });
  }

  // 4. Default Internal Server Error
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal Server Error';

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: statusCode === 500 && env.NODE_ENV === 'production'
        ? 'An unexpected server error occurred.'
        : message,
      ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
}
