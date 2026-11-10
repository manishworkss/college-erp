import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedStudents } from '@/lib/services/student-directory';
import { prisma } from '@/lib/prisma';
import { StudentStatus } from '@prisma/client';
import { z } from 'zod';

const createStudentSchema = z.object({
  fullName: z.string().min(2),
  fatherName: z.string().min(2),
  motherName: z.string().min(2),
  dateOfBirth: z.string().transform((val) => new Date(val)),
  gender: z.enum(['Male', 'Female', 'Other']),
  category: z.enum(['GEN', 'OBC', 'EBC', 'SC', 'ST', 'EWS']),
  aadharNo: z.string().optional(),
  phone: z.string().min(10),
  email: z.string().email(),
  address: z.string().min(5),
  sessionId: z.string(),
  courseId: z.string(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get('search') || undefined;
    const sessionId = searchParams.get('sessionId') || undefined;
    const courseId = searchParams.get('courseId') || undefined;
    const semesterStr = searchParams.get('semester');
    const semester = semesterStr ? parseInt(semesterStr, 10) : undefined;
    const status = (searchParams.get('status') as StudentStatus) || undefined;
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);

    const result = await getPaginatedStudents({
      searchTerm,
      sessionId,
      courseId,
      semester,
      status,
      category,
      page,
      pageSize,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error('Student fetch error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createStudentSchema.parse(body);

    // Generate unique Application Number: e.g. MKR-2026-XXXXX
    const year = new Date().getFullYear();
    const count = await prisma.student.count({
      where: { sessionId: validated.sessionId },
    });
    const applicationNo = `MKR-${year}-${String(count + 1).padStart(5, '0')}`;

    const student = await prisma.$transaction(async (tx) => {
      const created = await tx.student.create({
        data: {
          ...validated,
          applicationNo,
          currentSemester: 1,
          status: StudentStatus.APPLIED,
        },
      });

      // Initialize Semester 1 record
      await tx.studentSemesterRecord.create({
        data: {
          studentId: created.id,
          semester: 1,
          academicSessionId: validated.sessionId,
        },
      });

      return created;
    });

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error: unknown) {
    console.error('Student creation error:', error);
    const message = error instanceof Error ? error.message : 'Bad Request';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
