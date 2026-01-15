import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/paseto.js";
import { AppError } from "../utils/AppError.js";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Read access token ONLY from cookies
  const accessToken = req.cookies?.access_token;

  // Return 401 if access_token cookie is missing
  if (!accessToken) {
    return next(new AppError("You are not logged in", 401));
  }

  try {
    // Verify token using verifyAccessToken (PASETO)
    const decoded = await verifyAccessToken(accessToken);
    
    // Attach authenticated user to req.user with proper shape
    (req as any).user = {
      id: decoded.sub,
      email: decoded.email
    };
    
    next();
  } catch (err: any) {
    // More specific error handling
    if (err.message.includes('expired')) {
      return next(new AppError('Token has expired', 401));
    }
    if (err.message.includes('invalid')) {
      return next(new AppError('Invalid token', 401));
    }
    return next(new AppError('Authentication failed', 401));
  }
};