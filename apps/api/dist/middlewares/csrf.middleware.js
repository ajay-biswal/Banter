import { validateCsrfToken } from '../utils/csrf.js';
import { AppError } from '../utils/AppError.js';
export const csrfMiddleware = (req, res, next) => {
    // Only validate CSRF for state-changing methods
    if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH' && req.method !== 'DELETE') {
        return next();
    }
    // Skip CSRF validation for authentication routes that don't require it
    const publicRoutes = ['/api/auth/login', '/api/auth/register'];
    if (publicRoutes.some(route => req.originalUrl.startsWith(route))) {
        return next();
    }
    // Extract CSRF tokens
    const cookieToken = req.cookies?.csrf_token;
    const headerToken = req.headers['x-csrf-token'];
    // Validate the CSRF tokens
    if (!validateCsrfToken(cookieToken, headerToken)) {
        return next(new AppError('CSRF token mismatch', 403));
    }
    next();
};
//# sourceMappingURL=csrf.middleware.js.map