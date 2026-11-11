import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookieOptions } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  response.cookies.set({
    ...getAuthCookieOptions(request, 0),
    value: '',
  });

  return response;
}
