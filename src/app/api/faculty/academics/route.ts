import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AttendanceStatus, SubjectCategory } from '@prisma/client';
import { z } from 'zod';
import { ensureAcademicSessionAndCourse } from '@/lib/services/academic-structure';
import { getSessionFromRequest } from '@/lib/auth-server';

const attendancePayloadSchema = z.object({
  type: z.literal('ATTENDANCE'),
  department: z.string().min(2),
  courseCode: z.string().min(2),
  semester: z.number().int().min(1).max(8),
  timeSlot: z.string().optional().default('Morning Lecture'),
  records: z
    .array(
      z.object({
        studentId: z.string().min(1),
        status: z.nativeEnum(AttendanceStatus),
      })
    )
    .min(1, 'At least one student record required'),
});

const ciaMarksPayloadSchema = z.object({
  type: z.literal('CIA_MARKS'),
  department: z.string().min(2),
  courseCode: z.string().min(2),
  semester: z.number().int().min(1).max(8),
  marks: z
    .array(
      z.object({
        studentId: z.string().min(1),
        midTermExam: z.number().min(0).max(15),
        assignment: z.number().min(0).max(10),
        attendanceScore: z.number().min(0).max(5),
      })
    )
    .min(1, 'At least one student marks row required'),
});

async function resolveFacultyAndSubject(
  facultyIdFromSession: string | undefined,
  departmentName: string,
  courseCode: string,
  semester: number
) {
  const { session, course } = await ensureAcademicSessionAndCourse(courseCode);

  let faculty = facultyIdFromSession
    ? await prisma.faculty.findUnique({ where: { id: facultyIdFromSession } })
    : null;

  if (!faculty) {
    faculty = await prisma.faculty.findFirst({ where: { isActive: true } });
  }

  if (!faculty) {
    throw new Error(
      'No registered Faculty profile found in database. Super Admin must create at least one Faculty account first.'
    );
  }

  const deptSlug = departmentName
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 12);
  const subjectCode = `${course.code}-S${semester}-DEPT-${deptSlug}`;

  const subject = await prisma.subject.upsert({
    where: { code: subjectCode },
    update: {},
    create: {
      code: subjectCode,
      name: `${departmentName} (Semester ${semester})`,
      semester,
      credits: 4,
      category: SubjectCategory.MJC,
      courseId: course.id,
      departmentId: course.departmentId,
    },
  });

  return { session, course, faculty, subject };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ success: false, error: 'studentId is required.' }, { status: 400 });
    }

    const [attendance, ciaMarks] = await Promise.all([
      prisma.attendanceRecord.findMany({
        where: { studentId },
        orderBy: { date: 'desc' },
        include: { subject: { select: { name: true, code: true } } },
        take: 30,
      }),
      prisma.continuousInternalAssessment.findMany({
        where: { studentId },
        orderBy: { semester: 'desc' },
        include: { subject: { select: { name: true, code: true } } },
      }),
    ]);

    const totalClasses = attendance.length;
    const presentCount = attendance.filter((a) => a.status === AttendanceStatus.PRESENT).length;
    const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        attendanceSummary: { totalClasses, presentCount, percentage },
        attendanceRecords: attendance,
        ciaMarks: ciaMarks.map((c) => ({
          id: c.id,
          semester: c.semester,
          subjectName: c.subject.name,
          midTermExam: Number(c.midTermExam),
          assignment: Number(c.assignment),
          attendanceScore: Number(c.attendanceScore),
          totalCiaScore: Number(c.totalCiaScore),
        })),
      },
    });
  } catch (error: unknown) {
    console.error('Faculty academics GET error:', error);
    const message = error instanceof Error ? error.message : 'Database error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionUser = getSessionFromRequest(req);

    if (body.type === 'ATTENDANCE') {
      const validated = attendancePayloadSchema.parse(body);
      const { session, faculty, subject } = await resolveFacultyAndSubject(
        sessionUser?.facultyId,
        validated.department,
        validated.courseCode,
        validated.semester
      );

      const today = new Date();
      const totalPresent = validated.records.filter((r) => r.status === AttendanceStatus.PRESENT).length;
      const totalAbsent = validated.records.length - totalPresent;

      const createdSession = await prisma.$transaction(async (tx) => {
        const attSession = await tx.attendanceSession.create({
          data: {
            facultyId: faculty.id,
            subjectId: subject.id,
            academicSessionId: session.id,
            semester: validated.semester,
            sessionDate: today,
            timeSlot: validated.timeSlot,
            totalPresent,
            totalAbsent,
          },
        });

        await tx.attendanceRecord.createMany({
          data: validated.records.map((rec) => ({
            sessionId: attSession.id,
            studentId: rec.studentId,
            facultyId: faculty.id,
            subjectId: subject.id,
            semester: validated.semester,
            date: today,
            status: rec.status,
          })),
        });

        await tx.auditLog.create({
          data: {
            userId: sessionUser?.userId,
            action: 'ATTENDANCE_RECORDED',
            entity: 'AttendanceSession',
            entityId: attSession.id,
            details: JSON.stringify({
              department: validated.department,
              semester: validated.semester,
              totalPresent,
              totalAbsent,
            }),
          },
        });

        return attSession;
      });

      return NextResponse.json({
        success: true,
        message: `Attendance saved! Present: ${totalPresent}, Absent: ${totalAbsent}.`,
        sessionId: createdSession.id,
      });
    }

    if (body.type === 'CIA_MARKS') {
      const validated = ciaMarksPayloadSchema.parse(body);
      const { faculty, subject } = await resolveFacultyAndSubject(
        sessionUser?.facultyId,
        validated.department,
        validated.courseCode,
        validated.semester
      );

      await prisma.$transaction(async (tx) => {
        for (const row of validated.marks) {
          const totalCiaScore = row.midTermExam + row.assignment + row.attendanceScore;
          await tx.continuousInternalAssessment.upsert({
            where: {
              studentId_subjectId_semester: {
                studentId: row.studentId,
                subjectId: subject.id,
                semester: validated.semester,
              },
            },
            update: {
              facultyId: faculty.id,
              midTermExam: row.midTermExam,
              assignment: row.assignment,
              attendanceScore: row.attendanceScore,
              totalCiaScore,
              isFinalized: true,
              evaluationDate: new Date(),
            },
            create: {
              facultyId: faculty.id,
              subjectId: subject.id,
              studentId: row.studentId,
              semester: validated.semester,
              midTermExam: row.midTermExam,
              assignment: row.assignment,
              attendanceScore: row.attendanceScore,
              totalCiaScore,
              isFinalized: true,
            },
          });
        }

        await tx.auditLog.create({
          data: {
            userId: sessionUser?.userId,
            action: 'CIA_MARKS_SAVED',
            entity: 'ContinuousInternalAssessment',
            details: JSON.stringify({
              department: validated.department,
              semester: validated.semester,
              count: validated.marks.length,
            }),
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: `CIA Marks saved and locked for ${validated.marks.length} student(s).`,
      });
    }

    return NextResponse.json({ success: false, error: 'Unsupported operation type.' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Faculty academics POST error:', error);
    const zodMsg = (error as { errors?: Array<{ message: string }> })?.errors?.[0]?.message;
    const message = zodMsg || (error instanceof Error ? error.message : 'Failed to save academic records.');
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

