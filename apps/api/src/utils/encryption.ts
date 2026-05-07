import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';

// Check if encryption is enabled
const isEncryptionEnabled = (): boolean => {
  return !!process.env.MESSAGE_SECRET_KEY;
};

// Ensure key is exactly 32 bytes (256 bits)
const getKey = (): Buffer => {
  const secretKey = process.env.MESSAGE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('MESSAGE_SECRET_KEY environment variable is required');
  }
  
  const keyBuffer = Buffer.from(secretKey, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error('MESSAGE_SECRET_KEY must be exactly 32 characters');
  }
  return keyBuffer;
};

export interface EncryptedMessage {
  content: string;
  iv: string;
}

/**
 * Encrypt message text using AES-256-CBC
 * @param text - Plain text message to encrypt
 * @returns Encrypted message with IV
 */
export const encryptMessage = (text: string): EncryptedMessage => {
  // If encryption is not configured, return plain text
  if (!isEncryptionEnabled()) {
    console.warn('⚠️  MESSAGE_SECRET_KEY not set - messages will NOT be encrypted');
    return { content: text, iv: '' };
  }

  if (!text) {
    return { content: '', iv: '' };
  }

  try {
    // Generate random IV for each message
    const iv = crypto.randomBytes(16);
    const key = getKey();

    // Create cipher
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // Encrypt the text
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Return encrypted content and IV (in hex format for storage)
    return {
      content: encrypted,
      iv: iv.toString('hex')
    };
  } catch (error) {
    console.error('Encryption error:', error);
    // Fallback to plain text if encryption fails
    return { content: text, iv: '' };
  }
};

/**
 * Decrypt message text using AES-256-CBC
 * @param encryptedText - Encrypted message content
 * @param ivHex - IV in hexadecimal format
 * @returns Decrypted plain text
 */
export const decryptMessage = (encryptedText: string, ivHex: string): string => {
  // If no IV, return content as-is (not encrypted or encryption disabled)
  if (!ivHex || !encryptedText) {
    return encryptedText || '';
  }

  // If encryption is not configured, return content as-is
  if (!isEncryptionEnabled()) {
    return encryptedText;
  }

  try {
    const key = getKey();
    const iv = Buffer.from(ivHex, 'hex');

    // Create decipher
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    // Decrypt the text
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return '[Unable to decrypt message]';
  }
};
