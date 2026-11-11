import { Prisma, SubjectCategory } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import {
  calculateSemesterFeeBreakdown,
  FeeBreakdown,
  formatApplicationNo,
  formatCollegeRollNo,
  formatRegistrationCode,
  resolveCourseConfig,
} from '@/lib/college-config';

export interface CbcsSubjectChoices {
  mjcSubject?: string;
  micSubject?: string;
  mdcSubject?: string;
  aecSubject?: string;
  secSubject?: string;
  vacSubject?: string;
}

/**
 * Ensures the active AcademicSession and requested Course/Department exist in MySQL.
 * Accepts either Course.id, Course.code ("BA-SS", "BA-HUM", "BCOM"), or Faculty label ("Social Science", etc.).
 */
export async function ensureAcademicSessionAndCourse(
  courseIdentifier: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma
) {
  let session = await tx.academicSession.findFirst({
    where: { isCurrent: true },
  });

  if (!session) {
    session = await tx.academicSession.upsert({
      where: { name: '2026-2030' },
      update: { isCurrent: true },
      create: {
        name: '2026-2030',
        startYear: 2026,
        endYear: 2030,
        isCurrent: true,
      },
    });
  }

  // First try looking up directly by primary key ID
  const byId = await tx.course.findUnique({
    where: { id: courseIdentifier },
  });
  if (byId) {
    return { session, course: byId };
  }

  const config = resolveCourseConfig(courseIdentifier);

  let course = await tx.course.findUnique({
    where: { code: config.code },
  });

  if (!course) {
    let dept = await tx.department.findUnique({
      where: { code: config.code },
    });

    if (!dept) {
      dept = await tx.department.findFirst({
        where: { facultyType: config.facultyType },
      });
    }

    if (!dept) {
      dept = await tx.department.create({
        data: {
          name: `Faculty of ${config.facultyType}`,
          code: config.code,
          facultyType: config.facultyType,
        },
      });
    }

    course = await tx.course.create({
      data: {
        name: config.name,
        code: config.code,
        departmentId: dept.id,
        durationYear: 4,
        totalSemesters: 8,
      },
    });
  }

  return { session, course };
}

/**
 * Resolves semester fee either from customized DB `SemesterFeeConfig` rows or canonical catalog defaults.
 */
export async function getEffectiveSemesterFee(
  courseId: string,
  courseCode: string,
  semester: number,
  category?: string,
  tx: Prisma.TransactionClient | typeof prisma = prisma
): Promise<FeeBreakdown> {
  const categoryKey = category?.toUpperCase() || 'ALL';

  const dbConfig =
    (await tx.semesterFeeConfig.findFirst({
      where: { courseId, semester, casteCategory: categoryKey, isActive: true },
    })) ||
    (await tx.semesterFeeConfig.findFirst({
      where: { courseId, semester, casteCategory: 'ALL', isActive: true },
    }));

  if (dbConfig) {
    return {
      tuitionFee: Number(dbConfig.tuitionFee),
      admissionFee: Number(dbConfig.admissionFee),
      examFee: Number(dbConfig.examFee),
      miscFee: Number(dbConfig.miscFee),
      totalAmount: Number(dbConfig.totalAmount),
    };
  }

  return calculateSemesterFeeBreakdown(courseCode, semester);
}

/**
 * Generates collision-free sequential Application Number and Registration Code for a given year.
 */
export async function generateSafeAdmissionCodes(
  tx: Prisma.TransactionClient,
  year: number
): Promise<{ applicationNo: string; registrationCode: string }> {
  const prefix = `MKR-${year}-`;
  const latest = await tx.student.findFirst({
    where: { applicationNo: { startsWith: prefix } },
    orderBy: { applicationNo: 'desc' },
    select: { applicationNo: true },
  });

  let nextSerial = 1;
  if (latest?.applicationNo) {
    const numPart = latest.applicationNo.replace(prefix, '');
    const parsed = parseInt(numPart, 10);
    if (!Number.isNaN(parsed)) {
      nextSerial = parsed + 1;
    }
  }

  // Fallback check to skip any gap collision with registrationCode
  let applicationNo = formatApplicationNo(year, nextSerial);
  let registrationCode = formatRegistrationCode(year, nextSerial);

  while (
    await tx.student.findFirst({
      where: { OR: [{ applicationNo }, { registrationCode }] },
      select: { id: true },
    })
  ) {
    nextSerial += 1;
    applicationNo = formatApplicationNo(year, nextSerial);
    registrationCode = formatRegistrationCode(year, nextSerial);
  }

  return { applicationNo, registrationCode };
}

/**
 * Generates collision-free stream Roll Number (e.g. 26/BASS/0001) across ALL statuses.
 */
export async function generateSafeCollegeRollNo(
  tx: Prisma.TransactionClient,
  courseId: string,
  courseCode: string,
  year: number
): Promise<string> {
  const config = resolveCourseConfig(courseCode);
  const shortYear = String(year).slice(-2);
  const prefix = `${shortYear}/${config.rollPrefix}/`;

  const latest = await tx.student.findFirst({
    where: {
      courseId,
      collegeRollNo: { startsWith: prefix },
    },
    orderBy: { collegeRollNo: 'desc' },
    select: { collegeRollNo: true },
  });

  let nextSerial = 1;
  if (latest?.collegeRollNo) {
    const numPart = latest.collegeRollNo.replace(prefix, '');
    const parsed = parseInt(numPart, 10);
    if (!Number.isNaN(parsed)) {
      nextSerial = parsed + 1;
    }
  }

  let candidate = formatCollegeRollNo(year, config.rollPrefix, nextSerial);
  while (
    await tx.student.findUnique({
      where: { collegeRollNo: candidate },
      select: { id: true },
    })
  ) {
    nextSerial += 1;
    candidate = formatCollegeRollNo(year, config.rollPrefix, nextSerial);
  }

  return candidate;
}

/**
 * Persists selected BRABU CBCS subjects into `Subject` & `StudentSubjectEnrollment`.
 */
export async function enrollStudentSubjects(
  tx: Prisma.TransactionClient,
  params: {
    studentId: string;
    courseId: string;
    courseCode: string;
    departmentId: string;
    semester: number;
    subjects: CbcsSubjectChoices;
  }
) {
  const entries: Array<{ category: SubjectCategory; name?: string }> = [
    { category: SubjectCategory.MJC, name: params.subjects.mjcSubject },
    { category: SubjectCategory.MIC, name: params.subjects.micSubject },
    { category: SubjectCategory.MDC, name: params.subjects.mdcSubject },
    { category: SubjectCategory.AEC, name: params.subjects.aecSubject },
    { category: SubjectCategory.SEC, name: params.subjects.secSubject },
    { category: SubjectCategory.VAC, name: params.subjects.vacSubject },
  ];

  for (const item of entries) {
    const cleanName = item.name?.trim();
    if (!cleanName) continue;

    const slug = cleanName
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 18);
    const subjectCode = `${params.courseCode}-S${params.semester}-${item.category}-${slug}`;

    const subject = await tx.subject.upsert({
      where: { code: subjectCode },
      update: { name: cleanName },
      create: {
        code: subjectCode,
        name: cleanName,
        semester: params.semester,
        credits: item.category === SubjectCategory.MJC ? 6 : 4,
        category: item.category,
        courseId: params.courseId,
        departmentId: params.departmentId,
      },
    });

    await tx.studentSubjectEnrollment.upsert({
      where: {
        studentId_subjectId_semester: {
          studentId: params.studentId,
          subjectId: subject.id,
          semester: params.semester,
        },
      },
      update: { isApproved: true },
      create: {
        studentId: params.studentId,
        subjectId: subject.id,
        semester: params.semester,
        isApproved: true,
      },
    });
  }
}

