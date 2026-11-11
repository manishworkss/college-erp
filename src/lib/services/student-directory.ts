import { prisma } from '@/lib/prisma';
import { Prisma, StudentStatus } from '@prisma/client';

export interface StudentQueryFilters {
  searchTerm?: string;
  sessionId?: string;
  courseId?: string;
  courseCode?: string;
  semester?: number;
  status?: StudentStatus;
  category?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedStudentsResult {
  data: Array<{
    id: string;
    applicationNo: string;
    registrationCode: string | null;
    collegeRollNo: string | null;
    universityRegNo: string | null;
    fullName: string;
    fatherName: string;
    dateOfBirth: string;
    phone: string;
    email: string;
    category: string;
    gender: string;
    currentSemester: number;
    status: StudentStatus;
    isOverdue: boolean;
    markedForDeletionAt: Date | null;
    sessionName: string;
    courseCode: string;
    courseName: string;
    createdAt: Date;
  }>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

/**
 * High-Throughput Student Directory Query Engine
 * Optimized for MySQL indexed traversal across 50,000+ records.
 */
export async function getPaginatedStudents(
  filters: StudentQueryFilters
): Promise<PaginatedStudentsResult> {
  const {
    searchTerm,
    sessionId,
    courseId,
    courseCode,
    semester,
    status,
    category,
    page = 1,
    pageSize = 25,
  } = filters;

  const take = Math.min(Math.max(pageSize, 1), 100);
  const skip = (Math.max(page, 1) - 1) * take;

  const where: Prisma.StudentWhereInput = {};

  if (sessionId) where.sessionId = sessionId;
  if (courseId) where.courseId = courseId;
  if (courseCode && courseCode !== 'all') {
    where.course = { code: courseCode };
  }
  if (semester && !Number.isNaN(semester)) where.currentSemester = semester;
  if (status) where.status = status;
  if (category) where.category = category;

  if (searchTerm && searchTerm.trim() !== '') {
    const term = searchTerm.trim();
    where.OR = [
      { applicationNo: { startsWith: term } },
      { registrationCode: { startsWith: term } },
      { collegeRollNo: { startsWith: term } },
      { universityRegNo: { startsWith: term } },
      { phone: { startsWith: term } },
      { fullName: { contains: term } },
    ];
  }

  const [total, students] = await Promise.all([
    prisma.student.count({ where }),
    prisma.student.findMany({
      where,
      take,
      skip,
      orderBy: [
        { currentSemester: 'asc' },
        { collegeRollNo: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        applicationNo: true,
        registrationCode: true,
        collegeRollNo: true,
        universityRegNo: true,
        fullName: true,
        fatherName: true,
        dateOfBirth: true,
        phone: true,
        email: true,
        category: true,
        gender: true,
        currentSemester: true,
        status: true,
        isOverdue: true,
        markedForDeletionAt: true,
        createdAt: true,
        session: { select: { name: true } },
        course: { select: { code: true, name: true } },
      },
    }),
  ]);

  return {
    data: students.map((s) => ({
      id: s.id,
      applicationNo: s.applicationNo,
      registrationCode: s.registrationCode,
      collegeRollNo: s.collegeRollNo,
      universityRegNo: s.universityRegNo,
      fullName: s.fullName,
      fatherName: s.fatherName,
      dateOfBirth: s.dateOfBirth.toISOString().split('T')[0],
      phone: s.phone,
      email: s.email,
      category: s.category,
      gender: s.gender,
      currentSemester: s.currentSemester,
      status: s.status,
      isOverdue: s.isOverdue,
      markedForDeletionAt: s.markedForDeletionAt,
      sessionName: s.session.name,
      courseCode: s.course.code,
      courseName: s.course.name,
      createdAt: s.createdAt,
    })),
    pagination: {
      total,
      page,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    },
  };
}
