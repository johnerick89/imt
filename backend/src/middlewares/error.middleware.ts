import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  stack?: string;
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal server error";
  let errorCode = "INTERNAL_ERROR";

  // Handle AppError instances
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    errorCode = error.errorCode || "APP_ERROR";
  } else {
    // Handle other types of errors
    console.error("Unexpected error:", error);

    // Handle specific error types
    if (error.name === "ValidationError") {
      statusCode = 400;
      message = "Validation error";
      errorCode = "VALIDATION_ERROR";
    } else if (error.name === "CastError") {
      statusCode = 400;
      message = "Invalid ID format";
      errorCode = "INVALID_ID";
    } else if (error.name === "MongoError" || error.name === "MongooseError") {
      statusCode = 500;
      message = "Database error";
      errorCode = "DATABASE_ERROR";
    } else if (error.name === "JsonWebTokenError") {
      statusCode = 401;
      message = "Invalid token";
      errorCode = "INVALID_TOKEN";
    } else if (error.name === "TokenExpiredError") {
      statusCode = 401;
      message = "Token expired";
      errorCode = "TOKEN_EXPIRED";
    }
  }

  // Log error details
  console.error(`Error ${statusCode}: ${message}`, {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  // Prepare response
  const response: ErrorResponse = {
    success: false,
    message,
    error: errorCode,
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === "development") {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

// Async error wrapper to catch async errors
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// 404 handler for undefined routes
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};
