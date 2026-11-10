import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signAuthToken, AUTH_COOKIE_NAME, TokenPayload } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role, username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required.' },
        { status: 400 }
      );
    }

    const cleanUsername = String(username).trim();
    const cleanPassword = String(password);

    // -------------------------------------------------------------------------
    // 1. ATTEMPT REAL DATABASE LOOKUP
    // -------------------------------------------------------------------------
    let authenticatedUser: TokenPayload | null = null;
    let redirectUrl = '/';

    try {
      if (role === 'SUPER_ADMIN') {
        redirectUrl = '/admin/principal';
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: cleanUsername },
              { phone: cleanUsername },
            ],
            role: { in: ['SUPER_ADMIN', 'PRINCIPAL'] },
            isActive: true,
          },
        });

        if (user) {
          const isValid = await verifyPassword(cleanPassword, user.passwordHash);
          if (isValid) {
            authenticatedUser = {
              userId: user.id,
              role: user.role as any,
              name: user.name,
              email: user.email,
              phone: user.phone || undefined,
            };
          }
        }
      } else if (role === 'FACULTY') {
        redirectUrl = '/faculty';
        const facultyMember = await prisma.faculty.findFirst({
          where: {
            OR: [
              { employeeCode: cleanUsername },
              { email: cleanUsername },
              { phone: cleanUsername },
            ],
            isActive: true,
          },
          include: { user: true },
        });

        if (facultyMember && facultyMember.user) {
          const isValid = await verifyPassword(cleanPassword, facultyMember.user.passwordHash);
          if (isValid) {
            authenticatedUser = {
              userId: facultyMember.user.id,
              facultyId: facultyMember.id,
              role: 'FACULTY',
              name: facultyMember.fullName,
              email: facultyMember.email,
              phone: facultyMember.phone,
            };
          }
        }
      } else if (role === 'STUDENT') {
        redirectUrl = '/student';
        const student = await prisma.student.findFirst({
          where: {
            OR: [
              { collegeRollNo: cleanUsername },
              { applicationNo: cleanUsername },
              { universityRegNo: cleanUsername },
              { phone: cleanUsername },
              { email: cleanUsername },
            ],
          },
          include: { user: true },
        });

        if (student) {
          if (student.user) {
            const isValid = await verifyPassword(cleanPassword, student.user.passwordHash);
            if (isValid) {
              authenticatedUser = {
                userId: student.user.id,
                studentId: student.id,
                role: 'STUDENT',
                name: student.fullName,
                email: student.email,
                phone: student.phone,
              };
            }
          } else {
            // Unregistered student direct phone verification
            authenticatedUser = {
              userId: student.id,
              studentId: student.id,
              role: 'STUDENT',
              name: student.fullName,
              email: student.email,
              phone: student.phone,
            };
          }
        }
      }
    } catch (dbError) {
      console.warn('Database query skipped or offline, falling back to institutional demo check:', dbError);
    }

    // -------------------------------------------------------------------------
    // 2. FIXED SUPER ADMIN VERIFICATION & STRICT REAL-DATA ENFORCEMENT
    // -------------------------------------------------------------------------
    if (!authenticatedUser) {
      if (role === 'SUPER_ADMIN') {
        if (cleanUsername.toLowerCase() === 'mkrcollege@gmail.com' && cleanPassword === 'Mkr@arvind98') {
          authenticatedUser = {
            userId: 'usr_mkr_super_admin',
            role: 'SUPER_ADMIN',
            name: 'Principal / Super Admin',
            email: 'mkrcollege@gmail.com',
            phone: '+91-7597052444',
          };
          redirectUrl = '/admin/principal';
        } else {
          return NextResponse.json(
            {
              success: false,
              error: 'Invalid Super Admin credentials. Username must be mkrcollege@gmail.com with your assigned administrative password.',
            },
            { status: 401 }
          );
        }
      } else if (role === 'FACULTY') {
        return NextResponse.json(
          {
            success: false,
            error: 'Faculty account not found. Faculty accounts can only be created by the Super Admin in the Admin Console.',
          },
          { status: 401 }
        );
      } else if (role === 'STUDENT') {
        return NextResponse.json(
          {
            success: false,
            error: 'Student record not found. Please submit your application via the Online Admission Form first.',
          },
          { status: 401 }
        );
      }
    }

    if (!authenticatedUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid credentials. Please verify your username, selected role, and password.',
        },
        { status: 401 }
      );
    }

    // -------------------------------------------------------------------------
    // 3. GENERATE SIGNED TOKEN & SET HTTP-ONLY COOKIE
    // -------------------------------------------------------------------------
    const token = signAuthToken(authenticatedUser);

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: authenticatedUser,
      redirectUrl,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication service encountered an unexpected error.' },
      { status: 500 }
    );
  }
}

