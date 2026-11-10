import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'mkr-college-erp-secure-jwt-secret-key-2026';
const TOKEN_EXPIRY = '7d';

export const AUTH_COOKIE_NAME = 'mkr_erp_token';

export interface TokenPayload {
  userId: string;
  role: 'SUPER_ADMIN' | 'PRINCIPAL' | 'FACULTY' | 'TEACHER' | 'STUDENT' | 'PARENT';
  name: string;
  email?: string;
  phone?: string;
  studentId?: string;
  facultyId?: string;
}

/**
 * Hash a raw password using bcrypt with 12 salt rounds
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compare plain password against bcrypt hash
 */
export async function verifyPassword(plainPassword: string, passwordHash: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, passwordHash);
}

/**
 * Sign a secure JWT for the user session
 */
export function signAuthToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

/**
 * Verify and decode an incoming JWT
 */
export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}
