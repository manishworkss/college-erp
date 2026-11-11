import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  StudentStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  SemesterRecordStatus,
} from '@prisma/client';
import { z } from 'zod';
import {
  computeOverdueRetention,
  evaluateRegistrationWindow,
  MAX_SEMESTERS,
  normalizeWindowDates,
  OVERDUE_GRACE_DAYS,
} from '@/lib/college-config';
import {
  enrollStudentSubjects,
  ensureAcademicSessionAndCourse,
  generateSafeAdmissionCodes,
  generateSafeCollegeRollNo,
  getEffectiveSemesterFee,
} from '@/lib/services/academic-structure';

const freshAdmissionSchema = z.object({
  firstName: z.string().min(2, 'First Name required'),
  middleName: z.string().optional().default(''),
  lastName: z.string().min(1, 'Last Name required'),
  gender: z.string(),
  dob: z.string().min(10, 'Valid Date of Birth required'),
  phone: z.string().min(10, '10-digit mobile required'),
  email: z.string().email().or(z.literal('')).optional().default(''),
  category: z.string().default('General'),
  religion: z.string().default('Hinduism'),
  maritalStatus: z.string().default('Unmarried'),

  faculty: z.string(),
  mjcSubject: z.string(),
  micSubject: z.string(),
  mdcSubject: z.string(),
  aecSubject: z.string().optional(),
  secSubject: z.string().optional(),
  vacSubject: z.string().optional(),

  fatherName: z.string().min(2, 'Father Name required'),
  fatherPhone: z.string().optional().default(''),
  motherName: z.string().min(2, 'Mother Name required'),

  aadhaarNo: z.string().optional().default(''),
  apaarNo: z.string().optional().default(''),
  currentAddress: z.string().min(5, 'Address required'),
  permanentAddress: z.string().optional().default(''),
  universityAppNo: z.string().optional().default(''),
});

const parsePaymentMethod = (raw?: string): PaymentMethod => {
  if (raw === PaymentMethod.BANK_CHALLAN) return PaymentMethod.BANK_CHALLAN;
  if (raw === PaymentMethod.UPI) return PaymentMethod.UPI;
  if (raw === PaymentMethod.CASH) return PaymentMethod.CASH;
  return PaymentMethod.ONLINE_GATEWAY;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'lookup';

    // 1. Lookup Student by Registration Code / Roll No / Application No / Phone
    if (action === 'lookup') {
      const code = searchParams.get('code')?.trim();
      if (!code) {
        return NextResponse.json(
          { success: false, error: 'Student Registration Code / Roll No is required.' },
          { status: 400 }
        );
      }

      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { registrationCode: code },
            { collegeRollNo: code },
            { applicationNo: code },
            { phone: code },
          ],
        },
        include: {
          course: true,
          session: true,
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          enrollments: {
            orderBy: { semester: 'desc' },
            include: { subject: true },
          },
        },
      });

      if (!student) {
        return NextResponse.json(
          {
            success: false,
            error: `No registered student record found matching code "${code}". Please verify or apply for fresh Semester 1 admission.`,
          },
          { status: 404 }
        );
      }

      const nextSemester = Math.min(student.currentSemester + 1, MAX_SEMESTERS);
      const maxReached = student.currentSemester >= MAX_SEMESTERS;
      const pendingApproval = student.status === StudentStatus.APPLIED;

      const window = maxReached
        ? null
        : await prisma.registrationWindow.findFirst({
            where: {
              courseId: student.courseId,
              semester: nextSemester,
              isActive: true,
            },
          });

      const windowEval = maxReached
        ? { status: 'CLOSED' as const, message: 'Student has already completed final Semester 8 registration.' }
        : evaluateRegistrationWindow(window, nextSemester);

      const feeBreakdown = await getEffectiveSemesterFee(
        student.courseId,
        student.course.code,
        nextSemester,
        student.category
      );

      const overdueInfo = computeOverdueRetention(student.markedForDeletionAt);

      return NextResponse.json({
        success: true,
        data: {
          id: student.id,
          registrationCode: student.registrationCode,
          collegeRollNo: student.collegeRollNo,
          applicationNo: student.applicationNo,
          fullName: student.fullName,
          firstName: student.firstName,
          middleName: student.middleName,
          lastName: student.lastName,
          fatherName: student.fatherName,
          fatherPhone: student.fatherPhone,
          motherName: student.motherName,
          dateOfBirth: student.dateOfBirth.toISOString().split('T')[0],
          gender: student.gender,
          category: student.category,
          religion: student.religion,
          maritalStatus: student.maritalStatus,
          phone: student.phone,
          email: student.email,
          address: student.address,
          currentAddress: student.currentAddress,
          status: student.status,
          pendingApproval,
          maxReached,
          currentSemester: student.currentSemester,
          nextSemester,
          courseName: student.course.name,
          courseCode: student.course.code,
          sessionName: student.session.name,
          windowStatus: windowEval.status,
          windowMessage: windowEval.message,
          windowDates: window ? { startDate: window.startDate, endDate: window.endDate } : null,
          feeBreakdown,
          isOverdue: student.isOverdue,
          overdueInfo,
          payments: student.payments.map((p) => ({
            receiptNo: p.receiptNo,
            amount: Number(p.amount),
            targetSemester: p.targetSemester,
            status: p.status,
            paidAt: p.paidAt,
          })),
        },
      });
    }

    // 2. Pending Admissions awaiting Super Admin Final Permission
    if (action === 'pending') {
      const pending = await prisma.student.findMany({
        where: {
          status: StudentStatus.APPLIED,
          currentSemester: 1,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          course: true,
          session: true,
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: pending.map((s) => ({
          id: s.id,
          applicationNo: s.applicationNo,
          registrationCode: s.registrationCode,
          fullName: s.fullName,
          phone: s.phone,
          email: s.email,
          category: s.category,
          gender: s.gender,
          courseName: s.course.name,
          courseCode: s.course.code,
          sessionName: s.session.name,
          status: s.status,
          createdAt: s.createdAt,
          payment: s.payments[0]
            ? {
                amount: Number(s.payments[0].amount),
                receiptNo: s.payments[0].receiptNo,
                status: s.payments[0].status,
                method: s.payments[0].paymentMethod,
              }
            : null,
        })),
      });
    }

    // 3. Super Admin Registration Windows
    if (action === 'windows') {
      const windows = await prisma.registrationWindow.findMany({
        orderBy: [{ courseId: 'asc' }, { semester: 'asc' }],
        include: {
          course: { select: { id: true, code: true, name: true } },
          academicSession: { select: { name: true } },
        },
      });

      return NextResponse.json({ success: true, data: windows });
    }

    // 4. Overdue & 30-Day Deletion Queue
    if (action === 'overdue') {
      const overdueStudents = await prisma.student.findMany({
        where: { isOverdue: true },
        orderBy: { markedForDeletionAt: 'asc' },
        include: {
          course: { select: { name: true, code: true } },
          session: { select: { name: true } },
        },
      });

      return NextResponse.json({
        success: true,
        data: overdueStudents.map((s) => {
          const retention = computeOverdueRetention(s.markedForDeletionAt, OVERDUE_GRACE_DAYS);
          return {
            id: s.id,
            fullName: s.fullName,
            applicationNo: s.applicationNo,
            registrationCode: s.registrationCode,
            collegeRollNo: s.collegeRollNo,
            phone: s.phone,
            currentSemester: s.currentSemester,
            courseName: s.course.name,
            courseCode: s.course.code,
            sessionName: s.session.name,
            markedForDeletionAt: s.markedForDeletionAt,
            daysElapsed: retention.daysElapsed,
            daysRemaining: retention.daysRemaining,
            purgeEligible: retention.purgeEligible,
          };
        }),
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action parameter.' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Admissions API GET error:', error);
    const message = error instanceof Error ? error.message : 'Database error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'FRESH_ADMISSION';

    // -----------------------------------------------------------------------
    // ACTION 1: FRESH SEMESTER 1 ADMISSION (Super Admin permission required)
    // -----------------------------------------------------------------------
    if (action === 'FRESH_ADMISSION') {
      const validated = freshAdmissionSchema.parse(body.formData);
      const selectedMethod = parsePaymentMethod(body.paymentMethod);

      const { session, course } = await ensureAcademicSessionAndCourse(validated.faculty);

      // Enforce Sem 1 registration window if configured by Super Admin
      const sem1Window = await prisma.registrationWindow.findFirst({
        where: { courseId: course.id, semester: 1, isActive: true },
      });
      const sem1Eval = evaluateRegistrationWindow(sem1Window, 1);
      if (sem1Eval.status !== 'OPEN') {
        return NextResponse.json({ success: false, error: sem1Eval.message }, { status: 403 });
      }

      const feeBreakdown = await getEffectiveSemesterFee(
        course.id,
        course.code,
        1,
        validated.category
      );

      const year = new Date().getFullYear();
      const fullName = `${validated.firstName} ${validated.middleName ? validated.middleName + ' ' : ''}${validated.lastName}`.trim();

      const result = await prisma.$transaction(async (tx) => {
        const { applicationNo, registrationCode } = await generateSafeAdmissionCodes(tx, year);

        const student = await tx.student.create({
          data: {
            applicationNo,
            registrationCode,
            fullName,
            firstName: validated.firstName,
            middleName: validated.middleName || null,
            lastName: validated.lastName,
            gender: validated.gender,
            dateOfBirth: new Date(validated.dob),
            phone: validated.phone,
            email: validated.email || `${applicationNo.toLowerCase()}@student.mkrcollege.com`,
            category: validated.category,
            religion: validated.religion,
            maritalStatus: validated.maritalStatus,
            fatherName: validated.fatherName,
            fatherPhone: validated.fatherPhone || null,
            motherName: validated.motherName,
            address: validated.permanentAddress?.trim() || validated.currentAddress,
            currentAddress: validated.currentAddress,
            aadharNo: validated.aadhaarNo || null,
            apaarNo: validated.apaarNo || null,
            universityAppNo: validated.universityAppNo || null,
            sessionId: session.id,
            courseId: course.id,
            currentSemester: 1,
            status: StudentStatus.APPLIED,
          },
        });

        await tx.studentSemesterRecord.create({
          data: {
            studentId: student.id,
            semester: 1,
            academicSessionId: session.id,
            status: SemesterRecordStatus.FEES_PAID,
            isFeeCleared: true,
          },
        });

        await enrollStudentSubjects(tx, {
          studentId: student.id,
          courseId: course.id,
          courseCode: course.code,
          departmentId: course.departmentId,
          semester: 1,
          subjects: {
            mjcSubject: validated.mjcSubject,
            micSubject: validated.micSubject,
            mdcSubject: validated.mdcSubject,
            aecSubject: validated.aecSubject,
            secSubject: validated.secSubject,
            vacSubject: validated.vacSubject,
          },
        });

        const receiptNo = `REC-${year}-S1-${Math.floor(100000 + Math.random() * 900000)}`;
        const payment = await tx.feePayment.create({
          data: {
            receiptNo,
            studentId: student.id,
            targetSemester: 1,
            paymentType: PaymentType.ADMISSION_CUM_SEM1,
            title: `Semester 1 Admission & CBCS Tuition Fee (${course.name})`,
            amount: feeBreakdown.totalAmount,
            paymentMethod: selectedMethod,
            status: PaymentStatus.COMPLETED,
            transactionRef: body.transactionRef || `GATEWAY-${Date.now()}`,
            paidAt: new Date(),
          },
        });

        await tx.auditLog.create({
          data: {
            action: 'FRESH_ADMISSION',
            entity: 'Student',
            entityId: student.id,
            details: JSON.stringify({
              applicationNo,
              registrationCode,
              receiptNo: payment.receiptNo,
              amount: feeBreakdown.totalAmount,
              courseCode: course.code,
            }),
          },
        });

        return { student, payment };
      });

      return NextResponse.json({
        success: true,
        message: 'Application & payment received! Retain your Registration Code for Semester 2 progression.',
        applicationNo: result.student.applicationNo,
        registrationCode: result.student.registrationCode,
        receiptNo: result.payment.receiptNo,
        amountPaid: Number(result.payment.amount),
        data: result.student,
      });
    }

    // -----------------------------------------------------------------------
    // ACTION 2: SEMESTER 2..8 PROGRESSION (Auto-promotion, Zero Admin Permission)
    // -----------------------------------------------------------------------
    if (action === 'PROGRESSION_REGISTER') {
      const { registrationCode, targetSemester, subjects, transactionRef, paymentMethod } = body;

      if (!registrationCode) {
        return NextResponse.json(
          { success: false, error: 'Registration Code is required.' },
          { status: 400 }
        );
      }

      const student = await prisma.student.findFirst({
        where: {
          OR: [{ registrationCode }, { collegeRollNo: registrationCode }, { applicationNo: registrationCode }],
        },
        include: { course: true, session: true },
      });

      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student record not found for provided code.' },
          { status: 404 }
        );
      }

      if (student.status === StudentStatus.APPLIED) {
        return NextResponse.json(
          {
            success: false,
            error: 'Your Semester 1 admission is still pending final approval by the Principal. Please wait for approval before registering for Semester 2.',
          },
          { status: 403 }
        );
      }

      const effectiveTargetSemester = Number(targetSemester || student.currentSemester + 1);
      if (effectiveTargetSemester !== student.currentSemester + 1 || effectiveTargetSemester > MAX_SEMESTERS) {
        return NextResponse.json(
          {
            success: false,
            error: `Invalid target semester (${effectiveTargetSemester}). You are currently in Semester ${student.currentSemester}.`,
          },
          { status: 400 }
        );
      }

      const window = await prisma.registrationWindow.findFirst({
        where: {
          courseId: student.courseId,
          semester: effectiveTargetSemester,
          isActive: true,
        },
      });

      const windowEval = evaluateRegistrationWindow(window, effectiveTargetSemester);
      if (windowEval.status !== 'OPEN') {
        return NextResponse.json({ success: false, error: windowEval.message }, { status: 403 });
      }

      const feeBreakdown = await getEffectiveSemesterFee(
        student.courseId,
        student.course.code,
        effectiveTargetSemester,
        student.category
      );

      const selectedMethod = parsePaymentMethod(paymentMethod);
      const year = new Date().getFullYear();
      const receiptNo = `REC-${year}-S${effectiveTargetSemester}-${Math.floor(100000 + Math.random() * 900000)}`;

      const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.feePayment.create({
          data: {
            receiptNo,
            studentId: student.id,
            targetSemester: effectiveTargetSemester,
            paymentType: PaymentType.SEMESTER_PROMOTION,
            title: `Semester ${effectiveTargetSemester} Re-Registration & Tuition Fee`,
            amount: feeBreakdown.totalAmount,
            paymentMethod: selectedMethod,
            status: PaymentStatus.COMPLETED,
            transactionRef: transactionRef || `UPI-PROM-${Date.now()}`,
            isPromotionTriggered: true,
            paidAt: new Date(),
          },
        });

        await tx.studentSemesterRecord.upsert({
          where: {
            studentId_semester: {
              studentId: student.id,
              semester: effectiveTargetSemester,
            },
          },
          update: {
            status: SemesterRecordStatus.FEES_PAID,
            isFeeCleared: true,
          },
          create: {
            studentId: student.id,
            semester: effectiveTargetSemester,
            academicSessionId: student.sessionId,
            status: SemesterRecordStatus.FEES_PAID,
            isFeeCleared: true,
          },
        });

        if (subjects) {
          await enrollStudentSubjects(tx, {
            studentId: student.id,
            courseId: student.courseId,
            courseCode: student.course.code,
            departmentId: student.course.departmentId,
            semester: effectiveTargetSemester,
            subjects,
          });
        }

        const updatedStudent = await tx.student.update({
          where: { id: student.id },
          data: {
            currentSemester: effectiveTargetSemester,
            status: StudentStatus.PROMOTED,
            isOverdue: false,
            markedForDeletionAt: null,
          },
        });

        await tx.promotionHistory.create({
          data: {
            studentId: student.id,
            fromSemester: student.currentSemester,
            toSemester: effectiveTargetSemester,
            academicSessionId: student.sessionId,
            triggerPaymentId: payment.id,
            promotedBy: 'AUTO_PAYMENT_PROMOTION',
            remarks: `Direct student re-registration for Semester ${effectiveTargetSemester} with receipt ${receiptNo}`,
          },
        });

        await tx.auditLog.create({
          data: {
            action: 'PROGRESSION_REGISTER',
            entity: 'Student',
            entityId: student.id,
            details: JSON.stringify({
              fromSemester: student.currentSemester,
              toSemester: effectiveTargetSemester,
              receiptNo,
              amount: feeBreakdown.totalAmount,
            }),
          },
        });

        return { updatedStudent, receiptNo, payment };
      });

      return NextResponse.json({
        success: true,
        message: `Successfully registered and promoted to Semester ${effectiveTargetSemester}!`,
        receiptNo: result.receiptNo,
        amountPaid: Number(result.payment.amount),
        newSemester: effectiveTargetSemester,
        studentName: student.fullName,
        rollNo: student.collegeRollNo || student.registrationCode,
      });
    }

    // -----------------------------------------------------------------------
    // ACTION 3: SUPER ADMIN FINAL APPROVAL & COLLEGE ROLL NO ALLOTMENT
    // -----------------------------------------------------------------------
    if (action === 'ADMIN_APPROVE') {
      const { studentId, collegeRollNo } = body;

      if (!studentId) {
        return NextResponse.json({ success: false, error: 'Student ID is required.' }, { status: 400 });
      }

      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { course: true },
      });

      if (!student) {
        return NextResponse.json({ success: false, error: 'Student record not found.' }, { status: 404 });
      }

      if (student.status !== StudentStatus.APPLIED && student.collegeRollNo) {
        return NextResponse.json({
          success: true,
          message: `Candidate is already approved with Roll No: ${student.collegeRollNo}`,
          data: student,
        });
      }

      const year = new Date().getFullYear();
      const updated = await prisma.$transaction(async (tx) => {
        const assignedRollNo =
          collegeRollNo?.trim() ||
          (await generateSafeCollegeRollNo(tx, student.courseId, student.course.code, year));

        const upd = await tx.student.update({
          where: { id: studentId },
          data: {
            collegeRollNo: assignedRollNo,
            status: StudentStatus.ADMITTED,
          },
        });

        await tx.auditLog.create({
          data: {
            action: 'ADMIN_APPROVE_SEM1',
            entity: 'Student',
            entityId: studentId,
            details: JSON.stringify({
              applicationNo: student.applicationNo,
              assignedRollNo,
            }),
          },
        });

        return upd;
      });

      return NextResponse.json({
        success: true,
        message: `Candidate approved! Assigned College Roll No: ${updated.collegeRollNo}`,
        data: updated,
      });
    }

    // -----------------------------------------------------------------------
    // ACTION 4: SUPER ADMIN CONFIGURE REGISTRATION TIME WINDOW
    // -----------------------------------------------------------------------
    if (action === 'SET_WINDOW') {
      const { courseId, courseCode, semester, startDate, endDate } = body;
      const identifier = courseId || courseCode;

      if (!identifier || !semester || !startDate || !endDate) {
        return NextResponse.json(
          { success: false, error: 'Course, Semester, Start Date, and End Date are required.' },
          { status: 400 }
        );
      }

      const normalized = normalizeWindowDates(String(startDate), String(endDate));
      const { session, course } = await ensureAcademicSessionAndCourse(String(identifier));
      const semNum = parseInt(String(semester), 10);

      if (Number.isNaN(semNum) || semNum < 1 || semNum > MAX_SEMESTERS) {
        return NextResponse.json(
          { success: false, error: 'Semester must be between 1 and 8.' },
          { status: 400 }
        );
      }

      const window = await prisma.registrationWindow.upsert({
        where: {
          courseId_semester_academicSessionId: {
            courseId: course.id,
            semester: semNum,
            academicSessionId: session.id,
          },
        },
        update: {
          startDate: normalized.startDate,
          endDate: normalized.endDate,
          isActive: true,
        },
        create: {
          courseId: course.id,
          semester: semNum,
          academicSessionId: session.id,
          startDate: normalized.startDate,
          endDate: normalized.endDate,
          graceDays: OVERDUE_GRACE_DAYS,
          isActive: true,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: 'SET_REGISTRATION_WINDOW',
          entity: 'RegistrationWindow',
          entityId: window.id,
          details: JSON.stringify({
            courseCode: course.code,
            semester: semNum,
            startDate: normalized.startDate,
            endDate: normalized.endDate,
          }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `Registration window for ${course.code} Semester ${semNum} saved (${normalized.startDate.toLocaleDateString('en-IN')} to ${normalized.endDate.toLocaleDateString('en-IN')}).`,
        data: window,
      });
    }

    // -----------------------------------------------------------------------
    // ACTION 5: SYNC OVERDUE STUDENTS AFTER DEADLINE EXPIRY
    // -----------------------------------------------------------------------
    if (action === 'SYNC_OVERDUE') {
      const now = new Date();
      const expiredWindows = await prisma.registrationWindow.findMany({
        where: {
          isActive: true,
          endDate: { lt: now },
          semester: { gt: 1 },
        },
      });

      let flaggedCount = 0;

      for (const win of expiredWindows) {
        const result = await prisma.student.updateMany({
          where: {
            courseId: win.courseId,
            sessionId: win.academicSessionId,
            currentSemester: { lt: win.semester },
            status: { in: [StudentStatus.ADMITTED, StudentStatus.PROMOTED] },
            isOverdue: false,
          },
          data: {
            isOverdue: true,
            markedForDeletionAt: win.endDate,
          },
        });
        flaggedCount += result.count;
      }

      return NextResponse.json({
        success: true,
        flaggedCount,
        message:
          flaggedCount > 0
            ? `${flaggedCount} unregistered student(s) moved to 30-day overdue retention queue.`
            : 'All enrolled students are up to date for closed registration windows.',
      });
    }

    // -----------------------------------------------------------------------
    // ACTION 6: RESTORE OVERDUE STUDENT (SUPER ADMIN EXEMPTION)
    // -----------------------------------------------------------------------
    if (action === 'RESTORE_STUDENT') {
      const { studentId } = body;
      if (!studentId) {
        return NextResponse.json({ success: false, error: 'Student ID required.' }, { status: 400 });
      }

      const restored = await prisma.student.update({
        where: { id: studentId },
        data: { isOverdue: false, markedForDeletionAt: null },
      });

      await prisma.auditLog.create({
        data: {
          action: 'RESTORE_OVERDUE_STUDENT',
          entity: 'Student',
          entityId: studentId,
          details: JSON.stringify({ applicationNo: restored.applicationNo, fullName: restored.fullName }),
        },
      });

      return NextResponse.json({
        success: true,
        message: `${restored.fullName} restored from deletion queue.`,
      });
    }

    // -----------------------------------------------------------------------
    // ACTION 7: PURGE EXPIRED STUDENTS (>30 DAYS OVERDUE) WITH FORENSIC SNAPSHOT
    // -----------------------------------------------------------------------
    if (action === 'PURGE_EXPIRED') {
      const cutoffDate = new Date(Date.now() - OVERDUE_GRACE_DAYS * 24 * 60 * 60 * 1000);
      const expiredStudents = await prisma.student.findMany({
        where: {
          isOverdue: true,
          markedForDeletionAt: { lte: cutoffDate },
        },
        include: { payments: true },
      });

      if (expiredStudents.length === 0) {
        return NextResponse.json({
          success: true,
          purgedCount: 0,
          message: 'No student records have crossed the 30-day overdue retention deadline yet.',
        });
      }

      await prisma.$transaction(async (tx) => {
        for (const st of expiredStudents) {
          await tx.auditLog.create({
            data: {
              action: 'OVERDUE_30DAY_PURGE',
              entity: 'Student',
              entityId: st.id,
              oldValues: JSON.stringify({
                applicationNo: st.applicationNo,
                registrationCode: st.registrationCode,
                collegeRollNo: st.collegeRollNo,
                fullName: st.fullName,
                currentSemester: st.currentSemester,
                markedForDeletionAt: st.markedForDeletionAt,
                paymentCount: st.payments.length,
              }),
              details: 'Purged automatically after failing semester registration within 30-day retention.',
            },
          });

          // Remove restricted payment rows after archiving summary in auditLog
          await tx.feePayment.deleteMany({ where: { studentId: st.id } });
          await tx.student.delete({ where: { id: st.id } });
        }
      });

      return NextResponse.json({
        success: true,
        purgedCount: expiredStudents.length,
        message: `Purged ${expiredStudents.length} expired student record(s) with audit trail preserved.`,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Admissions API POST error:', error);
    const zodErr = (error as { errors?: Array<{ message: string }> })?.errors?.[0]?.message;
    const message = zodErr || (error instanceof Error ? error.message : 'Server error processing request.');
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
