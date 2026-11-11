import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, signAuthToken, TokenPayload } from '@/lib/auth';
import { getAuthCookieOptions } from '@/lib/auth-server';

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

    let authenticatedUser: TokenPayload | null = null;
    let redirectUrl = '/';

    try {
      if (role === 'SUPER_ADMIN') {
        redirectUrl = '/admin/principal';
        const user = await prisma.user.findFirst({
          where: {
            OR: [{ email: cleanUsername }, { phone: cleanUsername }],
            role: { in: ['SUPER_ADMIN', 'PRINCIPAL'] },
            isActive: true,
          },
        });

        if (user) {
          const isValid = await verifyPassword(cleanPassword, user.passwordHash);
          if (isValid) {
            authenticatedUser = {
              userId: user.id,
              role: user.role as TokenPayload['role'],
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

        if (facultyMember && facultyMember.user && facultyMember.user.isActive) {
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
              { registrationCode: cleanUsername },
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
            // Students without a separate User login verify via Date of Birth (YYYY-MM-DD) or registered phone
            const dobIso = student.dateOfBirth.toISOString().split('T')[0];
            if (cleanPassword === dobIso || cleanPassword === student.phone) {
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
      }
    } catch (dbError) {
      console.warn('Database unavailable during login lookup:', dbError);
    }

    // Super Admin fixed institutional check (allows initial access before seed if DB is bootstrapping)
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
              error:
                'Invalid Super Admin credentials. Username must be mkrcollege@gmail.com with your assigned administrative password.',
            },
            { status: 401 }
          );
        }
      } else if (role === 'FACULTY') {
        return NextResponse.json(
          {
            success: false,
            error:
              'Invalid faculty credentials or inactive account. Faculty accounts are issued by Super Admin.',
          },
          { status: 401 }
        );
      } else if (role === 'STUDENT') {
        return NextResponse.json(
          {
            success: false,
            error:
              'Invalid student credentials. Use your Roll No / Reg Code / App No with your Date of Birth (YYYY-MM-DD) or registered mobile as password.',
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

    const token = signAuthToken(authenticatedUser);

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: authenticatedUser,
      redirectUrl,
    });

    response.cookies.set({
      ...getAuthCookieOptions(request, 60 * 60 * 24 * 7),
      value: token,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication service encountered an unexpected error.' },
      { status: 500 }
    );
  }
}
