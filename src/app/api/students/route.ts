import { NextRequest, NextResponse } from 'next/server';
import { getPaginatedStudents } from '@/lib/services/student-directory';
import { prisma } from '@/lib/prisma';
import { StudentStatus } from '@prisma/client';
import { generateSafeAdmissionCodes } from '@/lib/services/academic-structure';
import { z } from 'zod';

const createStudentSchema = z.object({
  fullName: z.string().min(2),
  fatherName: z.string().min(2),
  motherName: z.string().min(2),
  dateOfBirth: z.string().transform((val) => new Date(val)),
  gender: z.enum(['Male', 'Female', 'Transgender', 'Other']),
  category: z.enum(['General', 'GEN', 'BC', 'OBC', 'EBC', 'SC', 'ST', 'WBC', 'EWS']),
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
    const courseCode = searchParams.get('courseCode') || undefined;
    const semesterStr = searchParams.get('semester');
    const semester = semesterStr && semesterStr !== 'all' ? parseInt(semesterStr, 10) : undefined;
    const statusParam = searchParams.get('status');
    const status = statusParam && statusParam !== 'all' ? (statusParam as StudentStatus) : undefined;
    const category = searchParams.get('category') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '25', 10);

    const result = await getPaginatedStudents({
      searchTerm,
      sessionId,
      courseId,
      courseCode,
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

    const year = new Date().getFullYear();

    const student = await prisma.$transaction(async (tx) => {
      const { applicationNo, registrationCode } = await generateSafeAdmissionCodes(tx, year);

      const created = await tx.student.create({
        data: {
          ...validated,
          applicationNo,
          registrationCode,
          currentSemester: 1,
          status: StudentStatus.APPLIED,
        },
      });

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
