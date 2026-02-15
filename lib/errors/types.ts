// Error types for the application
export enum ErrorCode {
  // Authentication errors (1000-1099)
  UNAUTHORIZED = 1000,
  INVALID_CREDENTIALS = 1001,
  SESSION_EXPIRED = 1002,
  ACCESS_DENIED = 1003,

  // Validation errors (1100-1199)
  VALIDATION_ERROR = 1100,
  MISSING_REQUIRED_FIELD = 1101,
  INVALID_INPUT = 1102,

  // Database errors (1200-1299)
  DATABASE_ERROR = 1200,
  RECORD_NOT_FOUND = 1201,
  DUPLICATE_RECORD = 1202,

  // Integration errors (1300-1399)
  INTEGRATION_ERROR = 1300,
  SLACK_ERROR = 1301,
  STRIPE_ERROR = 1302,
  EMAIL_ERROR = 1303,
  SMS_ERROR = 1304,

  // Server errors (1400-1499)
  INTERNAL_SERVER_ERROR = 1400,
  SERVICE_UNAVAILABLE = 1401,
  RATE_LIMIT_EXCEEDED = 1402,

  // Business logic errors (1500-1599)
  BUSINESS_RULE_VIOLATION = 1500,
  INSUFFICIENT_PERMISSIONS = 1501,
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode = 500,
    public details?: any,
    public isOperational = true,
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Authentication failed", details?: any) {
    super(ErrorCode.UNAUTHORIZED, message, 401, details)
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", details?: any) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, details)
  }
}

export class DatabaseError extends AppError {
  constructor(message = "Database operation failed", details?: any) {
    super(ErrorCode.DATABASE_ERROR, message, 500, details)
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(ErrorCode.RECORD_NOT_FOUND, `${resource} not found`, 404)
  }
}

export class IntegrationError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(ErrorCode.INTEGRATION_ERROR, `${service} integration error: ${message}`, 502, details)
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Insufficient permissions", details?: any) {
    super(ErrorCode.INSUFFICIENT_PERMISSIONS, message, 403, details)
  }
}

export class ExternalAPIError extends AppError {
  constructor(service: string, message: string, details?: any) {
    super(ErrorCode.INTEGRATION_ERROR, `${service} API error: ${message}`, 502, details)
  }
}
