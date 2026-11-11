import { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, TokenPayload, verifyAuthToken } from '@/lib/auth';

/**
 * Extracts and verifies the authenticated session payload from an incoming NextRequest cookie.
 */
export function getSessionFromRequest(req: NextRequest): TokenPayload | null {
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyAuthToken(token);
}

/**
 * Computes safe cookie options that work both on HTTPS production hosts and local HTTP testing.
 */
export function getAuthCookieOptions(req: NextRequest, maxAge: number) {
  const forwardedProto = req.headers.get('x-forwarded-proto');
  const isHttps = req.nextUrl.protocol === 'https:' || forwardedProto === 'https';

  return {
    name: AUTH_COOKIE_NAME,
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  };
}

