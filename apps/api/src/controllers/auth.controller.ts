import { Request, Response } from 'express';
import { createUser, authenticateUser } from '../services/user.service.js';
import { storeRefreshTokenIdentifier, validateRefreshTokenIdentifier, removeRefreshTokenIdentifier } from '../services/refreshToken.service.js';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../utils/paseto.js';
import { User } from '../models/user.model.js';
import { getCurrentUser } from '../services/auth.service.js';
import { generateCsrfToken } from '../utils/csrf.js';
import argon2 from 'argon2';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // Create new user
    const userData = await createUser({ name, email, password });

    // Create tokens
    const accessToken = await createAccessToken({ sub: userData.id, email: userData.email });
    const refreshToken = await createRefreshToken({ 
      sub: userData.id, 
      tokenId: Date.now().toString(), 
      type: 'refresh' 
    });

    // Hash and store refresh token identifier
    const tokenIdentifierHash = await argon2.hash(Date.now().toString());
    await storeRefreshTokenIdentifier(userData.id, tokenIdentifierHash);

    // Generate and set CSRF token
    const csrfToken = generateCsrfToken();
    
    // Set cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: 'strict',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
    });
    
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false, // Needs to be accessible by frontend JavaScript
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict',
    });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Authenticate user
    const userData = await authenticateUser({ email, password });

    // Create tokens
    const accessToken = await createAccessToken({ sub: userData.id, email: userData.email });
    const refreshToken = await createRefreshToken({ 
      sub: userData.id, 
      tokenId: Date.now().toString(), 
      type: 'refresh' 
    });

    // Hash and store refresh token identifier
    const tokenIdentifierHash = await argon2.hash(Date.now().toString());
    await storeRefreshTokenIdentifier(userData.id, tokenIdentifierHash);

    // Generate and set CSRF token
    const csrfToken = generateCsrfToken();
    
    // Set cookies
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: 'strict',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
    });
    
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false, // Needs to be accessible by frontend JavaScript
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Login successful' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Refresh tokens
 */
export const refreshTokens = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      // Clear all auth cookies
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    // Verify refresh token
    let refreshTokenPayload;
    try {
      refreshTokenPayload = await verifyRefreshToken(refreshToken);
    } catch (error) {
      // Clear all auth cookies
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    // Check if refresh token is valid for this user
    const isValid = await validateRefreshTokenIdentifier(refreshTokenPayload.tokenId, refreshTokenPayload.sub);
    if (!isValid) {
      // Clear all auth cookies
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    // Get user
    const user = await User.findById(refreshTokenPayload.sub);
    if (!user) {
      // Clear all auth cookies
      clearAuthCookies(res);
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    // Create new tokens
    const newAccessToken = await createAccessToken({ sub: user._id.toString(), email: user.email });
    const newRefreshToken = await createRefreshToken({ 
      sub: user._id.toString(), 
      tokenId: Date.now().toString(), 
      type: 'refresh' 
    });

    // Update refresh token in database
    const newTokenIdentifierHash = await argon2.hash(Date.now().toString());
    await storeRefreshTokenIdentifier(user._id.toString(), newTokenIdentifierHash);

    // Generate and set CSRF token
    const csrfToken = generateCsrfToken();
    
    // Set new cookies
    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: 'strict',
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'strict',
    });
    
    res.cookie('csrf_token', csrfToken, {
      httpOnly: false, // Needs to be accessible by frontend JavaScript
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Tokens refreshed successfully' });
  } catch (error: any) {
    // Clear all auth cookies on any error during refresh
    clearAuthCookies(res);
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
};

/**
 * Logout user
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refresh_token;

    // If refresh token exists, invalidate it
    if (refreshToken) {
      try {
        const refreshTokenPayload = await verifyRefreshToken(refreshToken);
        await removeRefreshTokenIdentifier(refreshTokenPayload.sub);
      } catch (error) {
        // Even if token verification fails, still clear cookies
      }
    }

    // Clear all auth cookies
    clearAuthCookies(res);

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Helper function to clear all auth cookies
 */
const clearAuthCookies = (res: Response) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.clearCookie('csrf_token');
};

/**
 * Get current authenticated user
 */
export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized: No user information found' });
    }

    const user = await getCurrentUser(userId);
    
    res.status(200).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error: any) {
    if (error.statusCode) {
      res.status(error.statusCode).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};