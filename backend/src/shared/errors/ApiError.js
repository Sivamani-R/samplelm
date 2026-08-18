export class ApiError extends Error {
  constructor(message, statusCode, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
  }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad request', details = null) {
    super(message, 400, 'BAD_REQUEST', details);
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class BusinessLogicError extends ApiError {
  constructor(message, code = 'BUSINESS_RULE_VIOLATION', details = null) {
    super(message, 400, code, details);
  }
}

export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict', code = 'CONFLICT', details = null) {
    super(message, 409, code, details);
  }
}
