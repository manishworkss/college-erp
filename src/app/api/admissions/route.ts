import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { StudentStatus, PaymentMethod, PaymentStatus, PaymentType } from '@prisma/client';
import { z } from 'zod';

// =========================================================================
// VALIDATION SCHEMAS
// =========================================================================

const freshAdmissionSchema = z.object({
  // Basic Info
  firstName: z.string().min(2, 'First Name required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last Name required'),
  gender: z.string(),
  dob: z.string().min(10, 'Valid Date of Birth required'),
  phone: z.string().min(10, '10-digit mobile required'),
  email: z.string().email().or(z.literal('')),
  category: z.string().default('General'),
  religion: z.string().default('Hinduism'),
  maritalStatus: z.string().default('Unmarried'),

  // Program & CBCS
  faculty: z.string(), // "Social Science", "Humanities", "Commerce"
  mjcSubject: z.string(),
  micSubject: z.string(),
  mdcSubject: z.string(),
  aecSubject: z.string().optional(),
  secSubject: z.string().optional(),
  vacSubject: z.string().optional(),

  // Parents
  fatherName: z.string().min(2, 'Father Name required'),
  fatherPhone: z.string().optional(),
  motherName: z.string().min(2, 'Mother Name required'),

  // Academic Records
  matricBoard: z.string().optional(),
  matricPassingYear: z.string().optional(),
  matricRollNum: z.string().optional(),
  matricMarks: z.string().optional(),
  matricPercent: z.string().optional(),
  matricSchool: z.string().optional(),

  interBoard: z.string().optional(),
  interPassingYear: z.string().optional(),
  interRollNum: z.string().optional(),
  interMarks: z.string().optional(),
  interPercent: z.string().optional(),
  interSchool: z.string().optional(),

  // Identifiers & Address
  aadhaarNo: z.string().optional(),
  apaarNo: z.string().optional(),
  currentAddress: z.string().min(5, 'Address required'),
  permanentAddress: z.string().optional(),
  universityAppNo: z.string().optional(),
});

// =========================================================================
// GET HANDLER: LOOKUP EXISTING STUDENT, WINDOWS, & PENDING APPROVALS
// =========================================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'lookup';

    // 1. Student Lookup for Semester Progression (Sem 2 to 8)
    if (action === 'lookup') {
      const code = searchParams.get('code')?.trim();
      if (!code) {
        return NextResponse.json({ success: false, error: 'Student Registration Code / Roll No is required.' }, { status: 400 });
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
          semesterRecords: {
            orderBy: { semester: 'desc' },
            take: 1,
          },
        },
      });

      if (!student) {
        return NextResponse.json({
          success: false,
          error: `No registered student record found matching code "${code}". Please verify or apply for fresh Semester 1 admission.`,
        }, { status: 404 });
      }

      const nextSemester = student.currentSemester + 1;

      // Check if registration window is set and active for nextSemester
      const window = await prisma.registrationWindow.findFirst({
        where: {
          courseId: student.courseId,
          semester: nextSemester,
          isActive: true,
        },
      });

      const now = new Date();
      let windowStatus: 'OPEN' | 'NOT_STARTED' | 'CLOSED' = 'OPEN';
      let windowMessage = '';

      if (window) {
        if (now < window.startDate) {
          windowStatus = 'NOT_STARTED';
          windowMessage = `Registration for Semester ${nextSemester} will open on ${window.startDate.toLocaleDateString('en-IN')}.`;
        } else if (now > window.endDate) {
          windowStatus = 'CLOSED';
          windowMessage = `Registration window for Semester ${nextSemester} closed on ${window.endDate.toLocaleDateString('en-IN')}. Please contact administration.`;
        }
      }

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
          currentSemester: student.currentSemester,
          nextSemester,
          courseName: student.course.name,
          courseCode: student.course.code,
          sessionName: student.session.name,
          windowStatus,
          windowMessage,
          windowDates: window ? { startDate: window.startDate, endDate: window.endDate } : null,
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
                amount: s.payments[0].amount,
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
          course: { select: { code: true, name: true } },
          academicSession: { select: { name: true } },
        },
      });

      return NextResponse.json({ success: true, data: windows });
    }

    return NextResponse.json({ success: false, error: 'Unknown action parameter.' }, { status: 400 });
  } catch (error: any) {
    console.error('Admissions API GET error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Database error' }, { status: 500 });
  }
}

// =========================================================================
// POST HANDLER: FRESH ADMISSION, PROGRESSION, APPROVAL, & TIME WINDOWS
// =========================================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || 'FRESH_ADMISSION';

    // -----------------------------------------------------------------------
    // ACTION 1: FRESH SEMESTER 1 ADMISSION
    // -----------------------------------------------------------------------
    if (action === 'FRESH_ADMISSION') {
      const validated = freshAdmissionSchema.parse(body.formData);

      // Determine Course & Session
      let courseCode = 'BA-SS';
      if (validated.faculty === 'Humanities') courseCode = 'BA-HUM';
      if (validated.faculty === 'Commerce') courseCode = 'BCOM';

      // Ensure Course and Session exist in DB
      let session = await prisma.academicSession.findFirst({
        where: { isCurrent: true },
      });

      if (!session) {
        session = await prisma.academicSession.create({
          data: {
            name: '2026-2030',
            startYear: 2026,
            endYear: 2030,
            isCurrent: true,
          },
        });
      }

      let course = await prisma.course.findUnique({
        where: { code: courseCode },
      });

      if (!course) {
        let dept = await prisma.department.findFirst({
          where: { facultyType: validated.faculty },
        });

        if (!dept) {
          dept = await prisma.department.create({
            data: {
              name: `Faculty of ${validated.faculty}`,
              code: courseCode,
              facultyType: validated.faculty,
            },
          });
        }

        course = await prisma.course.create({
          data: {
            name:
              courseCode === 'BA-SS'
                ? "Bachelor's of Arts (BA) – Social Science"
                : courseCode === 'BA-HUM'
                ? "Bachelor's of Arts (B.A) – Humanities"
                : "Bachelor's of Commerce (B.COM)",
            code: courseCode,
            departmentId: dept.id,
            durationYear: 4,
            totalSemesters: 8,
          },
        });
      }

      const totalCount = await prisma.student.count();
      const year = new Date().getFullYear();
      const serial = String(totalCount + 1).padStart(5, '0');

      // 1. Application Reference Number (e.g. MKR-2026-00042)
      const applicationNo = `MKR-${year}-${serial}`;

      // 2. Persistent Registration Code generated in Sem 1 (Used for Sem 2..8 Progression)
      const registrationCode = `MKR-REG-${year}-${serial}`;

      const fullName = `${validated.firstName} ${validated.middleName ? validated.middleName + ' ' : ''}${validated.lastName}`.trim();

      // Transaction: Create Student + Sem 1 Ledger Record
      const newStudent = await prisma.$transaction(async (tx) => {
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
            address: validated.currentAddress,
            currentAddress: validated.currentAddress,
            aadharNo: validated.aadhaarNo || null,
            apaarNo: validated.apaarNo || null,
            universityAppNo: validated.universityAppNo || null,
            sessionId: session.id,
            courseId: course.id,
            currentSemester: 1,
            status: StudentStatus.APPLIED, // Awaits Super Admin final permission
          },
        });

        // Initialize Semester 1 record
        await tx.studentSemesterRecord.create({
          data: {
            studentId: student.id,
            semester: 1,
            academicSessionId: session.id,
            isFeeCleared: true, // marked cleared upon fee checkout
          },
        });

        // Generate Fee Payment Transaction
        const paymentAmount = courseCode === 'BCOM' ? 3200 : 2800; // Real base fee breakdown
        await tx.feePayment.create({
          data: {
            receiptNo: `REC-${year}-S1-${Math.floor(100000 + Math.random() * 900000)}`,
            studentId: student.id,
            targetSemester: 1,
            paymentType: PaymentType.ADMISSION_CUM_SEM1,
            title: `Semester 1 Admission & CBCS Tuition Fee (${course.name})`,
            amount: paymentAmount,
            paymentMethod: PaymentMethod.ONLINE_GATEWAY,
            status: PaymentStatus.COMPLETED,
            transactionRef: body.transactionRef || `GATEWAY-${Date.now()}`,
            paidAt: new Date(),
          },
        });

        return student;
      });

      return NextResponse.json({
        success: true,
        message: 'Application & payment received! Retain your Registration Code for Semester 2 progression.',
        applicationNo: newStudent.applicationNo,
        registrationCode: newStudent.registrationCode,
        data: newStudent,
      });
    }

    // -----------------------------------------------------------------------
    // ACTION 2: SEMESTER 2..8 PROGRESSION (AUTO-PROMOTION, ZERO PERMISSION REQUIRED)
    // -----------------------------------------------------------------------
    if (action === 'PROGRESSION_REGISTER') {
      const { registrationCode, targetSemester, subjects, transactionRef } = body;

      if (!registrationCode || !targetSemester) {
        return NextResponse.json({ success: false, error: 'Registration Code and Target Semester are required.' }, { status: 400 });
      }

      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { registrationCode },
            { collegeRollNo: registrationCode },
          ],
        },
        include: { course: true, session: true },
      });

      if (!student) {
        return NextResponse.json({ success: false, error: 'Student record not found.' }, { status: 404 });
      }

      // Check Time Window set by Super Admin
      const window = await prisma.registrationWindow.findFirst({
        where: {
          courseId: student.courseId,
          semester: targetSemester,
          isActive: true,
        },
      });

      const now = new Date();
      if (window) {
        if (now < window.startDate) {
          return NextResponse.json({
            success: false,
            error: `Registration for Semester ${targetSemester} has not started yet. Opens on ${window.startDate.toLocaleDateString('en-IN')}.`,
          }, { status: 403 });
        }
        if (now > window.endDate) {
          return NextResponse.json({
            success: false,
            error: `Registration deadline for Semester ${targetSemester} ended on ${window.endDate.toLocaleDateString('en-IN')}. Please contact Super Admin.`,
          }, { status: 403 });
        }
      }

      const year = new Date().getFullYear();
      const receiptNo = `REC-${year}-S${targetSemester}-${Math.floor(100000 + Math.random() * 900000)}`;
      const amount = student.course.code === 'BCOM' ? 3200 : 2800;

      // Execute Direct Auto-Promotion (No Super Admin permission needed as specified)
      const result = await prisma.$transaction(async (tx) => {
        // Record payment
        const payment = await tx.feePayment.create({
          data: {
            receiptNo,
            studentId: student.id,
            targetSemester,
            paymentType: PaymentType.SEMESTER_PROMOTION,
            title: `Semester ${targetSemester} Re-Registration & Tuition Fee`,
            amount,
            paymentMethod: PaymentMethod.ONLINE_GATEWAY,
            status: PaymentStatus.COMPLETED,
            transactionRef: transactionRef || `UPI-PROM-${Date.now()}`,
            paidAt: new Date(),
          },
        });

        // Create new semester record
        await tx.studentSemesterRecord.upsert({
          where: {
            studentId_semester: {
              studentId: student.id,
              semester: targetSemester,
            },
          },
          update: { isFeeCleared: true },
          create: {
            studentId: student.id,
            semester: targetSemester,
            academicSessionId: student.sessionId,
            isFeeCleared: true,
          },
        });

        // Promote student current semester
        const updatedStudent = await tx.student.update({
          where: { id: student.id },
          data: {
            currentSemester: targetSemester,
            status: StudentStatus.PROMOTED,
            isOverdue: false,
            markedForDeletionAt: null,
          },
        });

        // Create promotion audit log
        await tx.promotionHistory.create({
          data: {
            studentId: student.id,
            fromSemester: student.currentSemester,
            toSemester: targetSemester,
            academicSessionId: student.sessionId,
            triggerPaymentId: payment.id,
            promotedBy: 'AUTO_PAYMENT_PROMOTION',
            remarks: `Direct student re-registration for Semester ${targetSemester} with receipt ${receiptNo}`,
          },
        });

        return { updatedStudent, receiptNo, payment };
      });

      return NextResponse.json({
        success: true,
        message: `Successfully registered and promoted to Semester ${targetSemester}!`,
        receiptNo: result.receiptNo,
        newSemester: targetSemester,
        studentName: student.fullName,
        rollNo: student.collegeRollNo || student.registrationCode,
      });
    }

    // -----------------------------------------------------------------------
    // ACTION 3: SUPER ADMIN FINAL PERMISSION (APPROVE SEM 1 ADMISSION & ASSIGN ROLL NO)
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

      // Generate stream-wise Roll Number if not supplied
      let assignedRollNo = collegeRollNo;
      if (!assignedRollNo) {
        const streamCode = student.course.code.replace('-', '');
        const currentCount = await prisma.student.count({
          where: {
            courseId: student.courseId,
            status: StudentStatus.ADMITTED,
          },
        });
        assignedRollNo = `26/${streamCode}/${String(currentCount + 1).padStart(4, '0')}`;
      }

      const updated = await prisma.student.update({
        where: { id: studentId },
        data: {
          collegeRollNo: assignedRollNo,
          status: StudentStatus.ADMITTED,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Candidate approved! Assigned College Roll No: ${assignedRollNo}`,
        data: updated,
      });
    }

    // -----------------------------------------------------------------------
    // ACTION 4: SUPER ADMIN SET REGISTRATION TIME WINDOWS
    // -----------------------------------------------------------------------
    if (action === 'SET_WINDOW') {
      const { courseId, semester, startDate, endDate, sessionId } = body;

      if (!courseId || !semester || !startDate || !endDate) {
        return NextResponse.json({ success: false, error: 'Course, Semester, Start Date, and End Date are required.' }, { status: 400 });
      }

      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const active = await prisma.academicSession.findFirst({ where: { isCurrent: true } });
        activeSessionId = active?.id;
      }

      const window = await prisma.registrationWindow.upsert({
        where: {
          courseId_semester_academicSessionId: {
            courseId,
            semester: parseInt(semester, 10),
            academicSessionId: activeSessionId,
          },
        },
        update: {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive: true,
        },
        create: {
          courseId,
          semester: parseInt(semester, 10),
          academicSessionId: activeSessionId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          isActive: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Registration window for Semester ${semester} configured successfully (${window.startDate.toLocaleDateString('en-IN')} to ${window.endDate.toLocaleDateString('en-IN')}).`,
        data: window,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action.' }, { status: 400 });
  } catch (error: any) {
    console.error('Admissions API POST error:', error);
    return NextResponse.json(
      { success: false, error: error?.errors?.[0]?.message || error.message || 'Operation failed.' },
      { status: 400 }
    );
  }
}

