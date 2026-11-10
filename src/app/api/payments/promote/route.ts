import { NextRequest, NextResponse } from 'next/server';
import { processSemesterPaymentAndPromote } from '@/lib/services/promotion';
import { PaymentMethod } from '@prisma/client';
import { z } from 'zod';

const promotionPaymentSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  targetSemester: z.number().int().min(1).max(8),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.ONLINE_GATEWAY),
  transactionRef: z.string().min(3, 'Transaction reference/UTR is required'),
  gatewayOrderId: z.string().optional(),
  gatewaySignature: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = promotionPaymentSchema.parse(body);

    const result = await processSemesterPaymentAndPromote({
      ...validatedData,
      promotedBy: 'ONLINE_PAYMENT_SYSTEM',
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error('Promotion processing error:', error);
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

