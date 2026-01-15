import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";


export const errorHandler = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
)=>{
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            message: err.message
        });
    }

    console.log(err);

    res.status(500).json({
        message: "Internal Server Error"
    });
};