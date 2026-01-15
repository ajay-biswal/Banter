import { User } from '../models/user.model.js';
import argon2 from 'argon2';

/**
 * Hash the refresh token identifier using argon2
 */
export const hashRefreshTokenIdentifier = async (tokenIdentifier: string): Promise<string> => {
  return argon2.hash(tokenIdentifier);
};

/**
 * Compare a provided refresh token identifier with the stored hash
 */
export const compareRefreshTokenIdentifier = async (tokenIdentifier: string, hash: string): Promise<boolean> => {
  return argon2.verify(hash, tokenIdentifier);
};

/**
 * Store the hashed refresh token identifier in the user document
 */
export const storeRefreshTokenIdentifier = async (userId: string, tokenIdentifierHash: string) => {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: tokenIdentifierHash });
};

/**
 * Validate the refresh token identifier for a user
 * This function checks if the provided token identifier matches the stored hash for the user
 */
export const validateRefreshTokenIdentifier = async (tokenIdentifier: string, userId: string) => {
  // Find the specific user by ID
  const user = await User.findById(userId);
  
  if (!user || !user.refreshTokenHash) {
    return false;
  }
  
  // Compare the provided token identifier with the stored hash
  return compareRefreshTokenIdentifier(tokenIdentifier, user.refreshTokenHash);
};

/**
 * Remove refresh token identifier from user document (logout)
 */
export const removeRefreshTokenIdentifier = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
};