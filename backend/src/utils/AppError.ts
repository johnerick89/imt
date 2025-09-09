export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    errorCode?: string
  ) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
  }
}

// Predefined error types for common business logic errors
export class ValidationError extends AppError {
  constructor(message: string, errorCode?: string) {
    super(message, 400, true, errorCode || "VALIDATION_ERROR");
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, errorCode?: string) {
    super(message, 404, true, errorCode || "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, errorCode?: string) {
    super(message, 401, true, errorCode || "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, errorCode?: string) {
    super(message, 403, true, errorCode || "FORBIDDEN");
  }
}

export class ConflictError extends AppError {
  constructor(message: string, errorCode?: string) {
    super(message, 409, true, errorCode || "CONFLICT");
  }
}

export class InsufficientFundsError extends AppError {
  constructor(message: string, errorCode?: string) {
    super(message, 400, true, errorCode || "INSUFFICIENT_FUNDS");
  }
}

export class BusinessLogicError extends AppError {
  constructor(message: string, errorCode?: string) {
    super(message, 400, true, errorCode || "BUSINESS_LOGIC_ERROR");
  }
}
