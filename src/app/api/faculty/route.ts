import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const createFacultySchema = z.object({
  fullName: z.string().min(2, 'Full Name is required'),
  designation: z.string().min(2, 'Designation is required'),
  departmentName: z.string().min(2, 'Department is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid 10-digit phone required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  qualification: z.string().optional(),
});

const patchFacultySchema = z.object({
  facultyId: z.string().min(1, 'Faculty ID required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
  isActive: z.boolean().optional(),
});

export async function GET() {
  try {
    const faculty = await prisma.faculty.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        department: { select: { name: true, code: true } },
        user: { select: { id: true, email: true, isActive: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: faculty.map((f) => ({
        id: f.id,
        employeeCode: f.employeeCode,
        fullName: f.fullName,
        designation: f.designation,
        department: f.department?.name || 'General',
        email: f.email,
        phone: f.phone,
        qualification: f.qualification || '',
        isActive: f.isActive,
        createdAt: f.createdAt,
      })),
    });
  } catch (error: unknown) {
    console.error('Faculty GET error:', error);
    const message = error instanceof Error ? error.message : 'Database connection error';
    return NextResponse.json({ success: false, error: message, data: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createFacultySchema.parse(body);

    const passwordHash = await hashPassword(validated.password);
    const deptCode = validated.departmentName
      .replace(/[^A-Za-z]/g, '')
      .substring(0, 4)
      .toUpperCase() || 'FAC';

    const result = await prisma.$transaction(async (tx) => {
      let dept = await tx.department.findFirst({
        where: { OR: [{ name: validated.departmentName }, { code: deptCode }] },
      });

      if (!dept) {
        dept = await tx.department.create({
          data: {
            name: validated.departmentName,
            code: deptCode,
            facultyType: validated.departmentName === 'Commerce' ? 'Commerce' : 'Social Science',
          },
        });
      }

      const prefix = `MKR-${dept.code}-`;
      const latest = await tx.faculty.findFirst({
        where: { employeeCode: { startsWith: prefix } },
        orderBy: { employeeCode: 'desc' },
        select: { employeeCode: true },
      });

      let nextNum = 1;
      if (latest?.employeeCode) {
        const parsed = parseInt(latest.employeeCode.replace(prefix, ''), 10);
        if (!Number.isNaN(parsed)) nextNum = parsed + 1;
      }

      let employeeCode = `${prefix}${String(nextNum).padStart(3, '0')}`;
      while (await tx.faculty.findUnique({ where: { employeeCode }, select: { id: true } })) {
        nextNum += 1;
        employeeCode = `${prefix}${String(nextNum).padStart(3, '0')}`;
      }

      const user = await tx.user.create({
        data: {
          email: validated.email,
          phone: validated.phone,
          passwordHash,
          name: validated.fullName,
          role: 'FACULTY',
          isActive: true,
        },
      });

      const facultyProfile = await tx.faculty.create({
        data: {
          userId: user.id,
          employeeCode,
          fullName: validated.fullName,
          designation: validated.designation,
          departmentId: dept.id,
          email: validated.email,
          phone: validated.phone,
          qualification: validated.qualification || '',
          isActive: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'FACULTY_CREATE',
          entity: 'Faculty',
          entityId: facultyProfile.id,
          details: JSON.stringify({
            employeeCode,
            department: dept.name,
            email: validated.email,
          }),
        },
      });

      return { user, facultyProfile };
    });

    return NextResponse.json(
      {
        success: true,
        message: `Faculty account created successfully! Staff Code: ${result.facultyProfile.employeeCode}`,
        data: {
          id: result.facultyProfile.id,
          employeeCode: result.facultyProfile.employeeCode,
          fullName: result.facultyProfile.fullName,
          email: result.facultyProfile.email,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Faculty creation error:', error);
    const zodMsg = (error as { errors?: Array<{ message: string }> })?.errors?.[0]?.message;
    const message = zodMsg || (error instanceof Error ? error.message : 'Failed to create faculty account.');
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = patchFacultySchema.parse(body);

    const faculty = await prisma.faculty.findUnique({
      where: { id: validated.facultyId },
      include: { user: true },
    });

    if (!faculty || !faculty.userId) {
      return NextResponse.json({ success: false, error: 'Faculty account not found.' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      if (validated.newPassword) {
        const passwordHash = await hashPassword(validated.newPassword);
        await tx.user.update({
          where: { id: faculty.userId! },
          data: { passwordHash },
        });
      }

      if (typeof validated.isActive === 'boolean') {
        await tx.faculty.update({
          where: { id: faculty.id },
          data: { isActive: validated.isActive },
        });
        await tx.user.update({
          where: { id: faculty.userId! },
          data: { isActive: validated.isActive },
        });
      }

      await tx.auditLog.create({
        data: {
          action: validated.newPassword ? 'FACULTY_PASSWORD_RESET' : 'FACULTY_STATUS_UPDATE',
          entity: 'Faculty',
          entityId: faculty.id,
          details: JSON.stringify({
            employeeCode: faculty.employeeCode,
            passwordChanged: Boolean(validated.newPassword),
            isActive: validated.isActive,
          }),
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: validated.newPassword
        ? `Password updated for ${faculty.fullName}.`
        : `Status updated for ${faculty.fullName}.`,
    });
  } catch (error: unknown) {
    console.error('Faculty PATCH error:', error);
    const zodMsg = (error as { errors?: Array<{ message: string }> })?.errors?.[0]?.message;
    const message = zodMsg || (error instanceof Error ? error.message : 'Failed to update faculty account.');
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
