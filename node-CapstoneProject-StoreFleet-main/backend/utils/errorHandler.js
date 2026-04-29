export class ErrorHandler extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;

    // Capture stack trace for cleaner debugging
    Error.captureStackTrace(this, this.constructor);
  }
}