export class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
    }
}
//# sourceMappingURL=AppError.js.map