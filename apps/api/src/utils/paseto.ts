import { V3 } from "paseto";

// Lazy initialization of the PASETO key to avoid early loading before env vars are available
let _PASETO_KEY: Buffer | null = null;

const getPasetoKey = (): Buffer => {
  if (_PASETO_KEY === null) {
    const secret = process.env.PASETO_SECRET;
    if (!secret) {
      throw new Error("PASETO_SECRET environment variable is required");
    }
    
    // Decode the base64 secret
    const buffer = Buffer.from(secret, "base64");
    
    // Validate key length (should be 32 bytes for V3 local tokens)
    if (buffer.length !== 32) {
      throw new Error(`Invalid PASETO_SECRET length: expected 32 bytes, got ${buffer.length}. Generate a 32-byte base64-encoded key.`);
    }
    
    _PASETO_KEY = buffer;
  }
  
  return _PASETO_KEY;
};

export interface AccessTokenPayload{
    sub: string;
    email: string;
    [key: string]: unknown;
}

export interface RefreshTokenPayload{
    sub: string;
    tokenId: string; // Add the token identifier
    type: 'refresh';
    [key: string]: unknown;
}

export const createAccessToken = async (payload: AccessTokenPayload) => {
  try {
    return await V3.encrypt(payload as unknown as Record<PropertyKey, unknown>, getPasetoKey(), {
      expiresIn: "15m", // 15 minutes
      issuer: "connect-api",
      audience: "users"
    });
  } catch (error) {
    throw new Error(`Failed to create access token: ${error}`);
  }
};

export const createRefreshToken = async (payload: RefreshTokenPayload) => {
  try {
    return await V3.encrypt(payload as unknown as Record<PropertyKey, unknown>, getPasetoKey(), {
      expiresIn: "7d", // 7 days
      issuer: "connect-api",
      audience: "users"
    });
  } catch (error) {
    throw new Error(`Failed to create refresh token: ${error}`);
  }
};

export const verifyAccessToken = async (token: string) => {
  try {
    const payload = await V3.decrypt(token, getPasetoKey(), {
      issuer: "connect-api",
      audience: "users"
    });
    
    // Validate payload structure
    if (!payload.sub || !payload.email) {
      throw new Error("Invalid access token payload");
    }
    
    // Type assertion with validation
    const typedPayload = payload as Record<string, unknown>;
    if (typeof typedPayload.sub !== 'string' || typeof typedPayload.email !== 'string') {
      throw new Error('Invalid access token payload structure');
    }
    
    return {
      sub: typedPayload.sub,
      email: typedPayload.email
    } as AccessTokenPayload;
  } catch (error: any) {
    if (error.message?.includes('expired')) {
      throw new Error("Access token has expired");
    }
    if (error.message?.includes('invalid') || error.code === 'ERR_PASETO_INVALID') {
      throw new Error("Invalid access token");
    }
    throw new Error(`Access token verification failed: ${error.message}`);
  }
};

export const verifyRefreshToken = async (token: string) => {
  try {
    const payload = await V3.decrypt(token, getPasetoKey(), {
      issuer: "connect-api",
      audience: "users"
    });
    
    // Validate payload structure
    if (!payload.sub || !payload.tokenId || !payload.type || payload.type !== 'refresh') {
      throw new Error("Invalid refresh token payload");
    }
    
    // Type assertion with validation
    const typedPayload = payload as Record<string, unknown>;
    if (typeof typedPayload.sub !== 'string' || typeof typedPayload.tokenId !== 'string' || typedPayload.type !== 'refresh') {
      throw new Error('Invalid refresh token payload structure');
    }
    
    return {
      sub: typedPayload.sub,
      tokenId: typedPayload.tokenId,
      type: typedPayload.type as 'refresh'
    } as RefreshTokenPayload;
  } catch (error: any) {
    if (error.message?.includes('expired')) {
      throw new Error("Refresh token has expired");
    }
    if (error.message?.includes('invalid') || error.code === 'ERR_PASETO_INVALID') {
      throw new Error("Invalid refresh token");
    }
    throw new Error(`Refresh token verification failed: ${error.message}`);
  }
};