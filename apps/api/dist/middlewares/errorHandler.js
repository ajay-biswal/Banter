import { AppError } from "../utils/AppError.js";
export const errorHandler = (err, _req, res, _next) => {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            message: err.message
        });
    }
    console.log(err);
    res.status(500).json({
        message: "Internal Server Error"
    });
};
//# sourceMappingURL=errorHandler.js.map