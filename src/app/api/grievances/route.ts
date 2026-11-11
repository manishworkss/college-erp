import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createGrievanceSchema = z.object({
  submittedBy: z.enum(['STUDENT', 'PARENT', 'PUBLIC']).default('STUDENT'),
  name: z.string().min(2, 'Full name is required'),
  rollNoOrAppNo: z.string().optional().default(''),
  phone: z.string().min(10, 'Valid 10-digit mobile number required'),
  email: z.string().email('Valid email address required'),
  category: z.string().min(2, 'Category is required'),
  priority: z.string().optional().default('Medium'),
  subject: z.string().min(3, 'Subject headline is required'),
  description: z.string().min(10, 'Please provide full details'),
});

const patchGrievanceSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['PENDING', 'IN_REVIEW', 'RESOLVED', 'REJECTED']),
  adminRemarks: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticketNo = searchParams.get('ticketNo')?.trim();
    const listAll = searchParams.get('all') === 'true';

    if (ticketNo) {
      const ticket = await prisma.grievanceTicket.findUnique({
        where: { ticketNo },
        include: {
          student: {
            select: { fullName: true, applicationNo: true, collegeRollNo: true },
          },
        },
      });

      if (!ticket) {
        return NextResponse.json(
          { success: false, error: `No grievance ticket found matching "${ticketNo}".` },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: ticket });
    }

    if (listAll) {
      const tickets = await prisma.grievanceTicket.findMany({
        orderBy: { createdAt: 'desc' },
        take: 100,
        include: {
          student: {
            select: { fullName: true, applicationNo: true, collegeRollNo: true },
          },
        },
      });

      return NextResponse.json({ success: true, data: tickets });
    }

    return NextResponse.json({ success: false, error: 'Ticket number is required.' }, { status: 400 });
  } catch (error: unknown) {
    console.error('Grievance GET error:', error);
    const message = error instanceof Error ? error.message : 'Database connection error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createGrievanceSchema.parse(body);

    const year = new Date().getFullYear();

    const created = await prisma.$transaction(async (tx) => {
      let linkedStudentId: string | null = null;
      if (validated.rollNoOrAppNo) {
        const ref = validated.rollNoOrAppNo.trim();
        const student = await tx.student.findFirst({
          where: {
            OR: [{ collegeRollNo: ref }, { registrationCode: ref }, { applicationNo: ref }],
          },
          select: { id: true },
        });
        if (student) linkedStudentId = student.id;
      }

      let ticketNo = `MKR-GRV-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
      while (await tx.grievanceTicket.findUnique({ where: { ticketNo }, select: { id: true } })) {
        ticketNo = `MKR-GRV-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
      }

      const fullDescription = validated.rollNoOrAppNo
        ? `[Ref: ${validated.rollNoOrAppNo} | Priority: ${validated.priority}]\n${validated.description}`
        : `[Priority: ${validated.priority}]\n${validated.description}`;

      const ticket = await tx.grievanceTicket.create({
        data: {
          ticketNo,
          studentId: linkedStudentId,
          submittedBy: validated.submittedBy,
          name: validated.name,
          email: validated.email,
          phone: validated.phone,
          category: validated.category,
          subject: validated.subject,
          description: fullDescription,
          status: 'PENDING',
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'GRIEVANCE_LODGED',
          entity: 'GrievanceTicket',
          entityId: ticket.id,
          details: JSON.stringify({
            ticketNo,
            category: validated.category,
            submittedBy: validated.submittedBy,
          }),
        },
      });

      return ticket;
    });

    return NextResponse.json(
      {
        success: true,
        message: `Grievance ticket ${created.ticketNo} registered successfully.`,
        ticketNo: created.ticketNo,
        data: created,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Grievance POST error:', error);
    const zodMsg = (error as { errors?: Array<{ message: string }> })?.errors?.[0]?.message;
    const message = zodMsg || (error instanceof Error ? error.message : 'Failed to lodge grievance.');
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = patchGrievanceSchema.parse(body);

    const updated = await prisma.grievanceTicket.update({
      where: { id: validated.id },
      data: {
        status: validated.status,
        adminRemarks: validated.adminRemarks || null,
        resolvedAt: validated.status === 'RESOLVED' ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Ticket ${updated.ticketNo} marked as ${updated.status}.`,
      data: updated,
    });
  } catch (error: unknown) {
    console.error('Grievance PATCH error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update grievance.';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

