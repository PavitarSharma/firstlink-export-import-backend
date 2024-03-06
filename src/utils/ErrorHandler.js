class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;

    // Ensure the class extends built-in Error
    Object.setPrototypeOf(this, ErrorHandler.prototype);
  }
}

export default ErrorHandler;
