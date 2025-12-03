// lib/errorHandler.js (Next.js App Router version)
export class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    this.timestamp = new Date().toISOString();
  }
}

export class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return Response.json(
      {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    );
  }

  static error(message = 'Error', statusCode = 500, errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    if (process.env.NODE_ENV === 'development') {
      response.debug = { statusCode };
    }

    return Response.json(response, { status: statusCode });
  }

  static created(data, message = 'Created successfully') {
    return this.success(data, message, 201);
  }

  static notFound(message = 'Resource not found') {
    return this.error(message, 404);
  }

  static badRequest(message = 'Bad request', errors = null) {
    return this.error(message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return this.error(message, 401);
  }
}

export const handleApiError = (error) => {
  console.log(error)
  console.error('API Error:', {
    message: error?.errors ? error?.errors[0].message : error.message,
    name: error.name,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (error.name === 'CastError') {
    return new AppError(`Resource not found with id of ${error.value}`, 404);
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyValue || {})[0];
    const value = Object.values(error.keyValue || {})[0];
    return new AppError(`Duplicate field value: '${value}' already exists for ${field}`, 409);
  }

  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(val => val.message);
    return new AppError(`Validation failed: ${messages.join(', ')}`, 400);
  }

  if (error.name === 'JsonWebTokenError') {
    return new AppError('Invalid authentication token', 401);
  }

  if (error.name === 'TokenExpiredError') {
    return new AppError('Authentication token expired', 401);
  }

  if (error instanceof AppError) {
    return error;
  }

  return new AppError(error.message || 'Internal Server Error', 500);
};

export const withErrorHandler = (handler) => async (request, context) => {
  try {
    return await handler(request, context);
  } catch (error) {
    const handledError = handleApiError(error);

    return Response.json(
      {
        success: false,
        error: handledError.message,
        timestamp: handledError.timestamp,
        ...(process.env.NODE_ENV === 'development' && {
          stack: handledError.stack,
          details: {
            name: handledError.name,
            statusCode: handledError.statusCode
          }
        })
      },
      { status: handledError.statusCode }
    );
  }
};