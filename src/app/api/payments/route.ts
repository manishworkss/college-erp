import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PaymentStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId') || undefined;
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '50', 10), 1), 200);

    const where = studentId ? { studentId } : {};

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [payments, completedSum, todaySum, pendingCount] = await Promise.all([
      prisma.feePayment.findMany({
        where,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              fullName: true,
              applicationNo: true,
              registrationCode: true,
              collegeRollNo: true,
              course: { select: { name: true, code: true } },
            },
          },
        },
      }),
      prisma.feePayment.aggregate({
        where: { ...where, status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.feePayment.aggregate({
        where: {
          ...where,
          status: PaymentStatus.COMPLETED,
          paidAt: { gte: startOfToday },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.feePayment.count({
        where: { ...where, status: PaymentStatus.PENDING },
      }),
    ]);

    return NextResponse.json({
      success: true,
      summary: {
        todayCollection: Number(todaySum._sum.amount || 0),
        todayTransactions: todaySum._count.id,
        totalCleared: Number(completedSum._sum.amount || 0),
        totalCompletedTransactions: completedSum._count.id,
        pendingReconciliations: pendingCount,
      },
      data: payments.map((p) => ({
        id: p.id,
        receiptNo: p.receiptNo,
        title: p.title,
        targetSemester: p.targetSemester,
        paymentType: p.paymentType,
        paymentMethod: p.paymentMethod,
        status: p.status,
        amount: Number(p.amount),
        transactionRef: p.transactionRef,
        paidAt: p.paidAt,
        createdAt: p.createdAt,
        studentName: p.student.fullName,
        applicationNo: p.student.applicationNo,
        registrationCode: p.student.registrationCode,
        collegeRollNo: p.student.collegeRollNo,
        courseCode: p.student.course.code,
        courseName: p.student.course.name,
      })),
    });
  } catch (error: unknown) {
    console.error('Payments ledger GET error:', error);
    const message = error instanceof Error ? error.message : 'Database connection error';
    return NextResponse.json({ success: false, error: message, data: [] }, { status: 500 });
  }
}

