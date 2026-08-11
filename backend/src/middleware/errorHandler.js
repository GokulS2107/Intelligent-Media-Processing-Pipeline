const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error response
  let statusCode = err.status || 500;
  let errorCode = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'Internal server error';

  // Handle multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    errorCode = 'FILE_TOO_LARGE';
    message = `File size exceeds limit of ${process.env.MAX_FILE_SIZE || 10}MB`;
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
    message = err.message;
  }

  // Handle duplicate key errors
  if (err.code === 11000) {
    statusCode = 409;
    errorCode = 'DUPLICATE_ERROR';
    message = 'Resource already exists';
  }

  // Handle cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    errorCode = 'INVALID_ID';
    message = 'Invalid ID format';
  }

  // Don't expose stack traces in production
  const response = {
    success: false,
    error: {
      code: errorCode,
      message: message
    }
  };

  if (process.env.NODE_ENV === 'development') {
    response.error.stack = err.stack;
    response.error.details = err.details || err;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;