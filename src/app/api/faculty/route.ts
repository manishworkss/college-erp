import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
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

export async function GET() {
  try {
    const faculty = await prisma.faculty.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        department: {
          select: { name: true, code: true },
        },
        user: {
          select: { id: true, email: true, isActive: true },
        },
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
  } catch (error: any) {
    // Return empty list if table is empty or database is initializing
    return NextResponse.json({ success: true, data: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createFacultySchema.parse(body);

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    // Ensure department exists or find first
    let dept = await prisma.department.findFirst({
      where: { name: validated.departmentName },
    });

    if (!dept) {
      dept = await prisma.department.create({
        data: {
          name: validated.departmentName,
          code: validated.departmentName.substring(0, 4).toUpperCase(),
          facultyType: 'Social Science',
        },
      });
    }

    const count = await prisma.faculty.count();
    const deptPrefix = dept.code || 'FAC';
    const employeeCode = `MKR-${deptPrefix}-${String(count + 1).padStart(3, '0')}`;

    // Transaction to create User and Faculty profile
    const result = await prisma.$transaction(async (tx) => {
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
  } catch (error: any) {
    console.error('Faculty creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.errors?.[0]?.message || error.message || 'Failed to create faculty account.',
      },
      { status: 400 }
    );
  }
}
