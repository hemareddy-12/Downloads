import crypto from 'crypto';

/**
 * Derives a cryptographically secure hash for an admin password using Node.js scrypt.
 * Uses 128-bit random salt and 64-byte key length (OWASP / NIST compliant).
 * Passwords are never stored in plaintext.
 */
export const hashPassword = (password, existingSalt = null) => {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password.trim(), salt, 64);
  return {
    salt,
    hash: derivedKey.toString('hex'),
  };
};

/**
 * Constant-time verification of password against stored cryptographic hash and salt.
 * Prevents timing attacks.
 */
export const verifyPassword = (password, storedHash, storedSalt) => {
  if (!password || !storedHash || !storedSalt) return false;
  try {
    const derivedKey = crypto.scryptSync(password.trim(), storedSalt, 64);
    const storedBuf = Buffer.from(storedHash, 'hex');
    if (derivedKey.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derivedKey, storedBuf);
  } catch (err) {
    console.error('[Auth Error] verifyPassword error:', err);
    return false;
  }
};

/**
 * Creates a signed base64url HMAC session token with 24-hour expiration.
 */
export const createToken = (email, role = 'owner', secret = 'hemareddy-haute-couture-2026') => {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
  const payload = `${email}:${role}:${expiresAt}`;
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return Buffer.from(`${payload}:${hmac}`).toString('base64url');
};

/**
 * Verifies and decodes a signed HMAC session token.
 */
export const verifyToken = (token, secret = 'hemareddy-haute-couture-2026', revokedTokens = null) => {
  if (!token || typeof token !== 'string') return null;
  if (revokedTokens && revokedTokens.has(token)) return null;

  try {
    const raw = Buffer.from(token, 'base64url').toString('utf8');
    const parts = raw.split(':');

    // New format: email:role:expiresAt:signature
    if (parts.length === 4) {
      const [email, role, expiresAtStr, signature] = parts;
      const expiresAt = parseInt(expiresAtStr, 10);
      if (isNaN(expiresAt) || Date.now() > expiresAt) {
        return null;
      }
      const expectedPayload = `${email}:${role}:${expiresAt}`;
      const expectedHmac = crypto.createHmac('sha256', secret).update(expectedPayload).digest('hex');
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expectedHmac);
      if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
        return { email, role };
      }
    }

    // Legacy format: email:expiresAt:signature
    if (parts.length === 3) {
      const [email, expiresAtStr, signature] = parts;
      const expiresAt = parseInt(expiresAtStr, 10);
      if (isNaN(expiresAt) || Date.now() > expiresAt) {
        return null;
      }
      const expectedPayload = `${email}:${expiresAt}`;
      const expectedHmac = crypto.createHmac('sha256', secret).update(expectedPayload).digest('hex');
      const sigBuf = Buffer.from(signature);
      const expBuf = Buffer.from(expectedHmac);
      if (sigBuf.length === expBuf.length && crypto.timingSafeEqual(sigBuf, expBuf)) {
        return { email, role: 'owner' };
      }
    }
  } catch (err) {
    // Malformed token
  }

  return null;
};
