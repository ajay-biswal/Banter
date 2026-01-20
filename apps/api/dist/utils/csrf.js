import { randomBytes } from 'crypto';
/**
 * Generate a cryptographically secure CSRF token
 */
export const generateCsrfToken = () => {
    return randomBytes(32).toString('hex');
};
/**
 * Validate CSRF token by comparing the cookie value with the header value
 */
export const validateCsrfToken = (cookieToken, headerToken) => {
    if (!cookieToken || !headerToken) {
        return false;
    }
    // Use timing-safe comparison to prevent timing attacks
    if (cookieToken.length !== headerToken.length) {
        return false;
    }
    // Perform constant-time comparison manually to prevent timing attacks
    let mismatch = 0;
    for (let i = 0; i < cookieToken.length; i++) {
        mismatch |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
    }
    return mismatch === 0;
};
//# sourceMappingURL=csrf.js.map