import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createNoticeSchema = z.object({
  title: z.string().min(3, 'Notice title is required'),
  content: z.string().min(5, 'Notice content is required'),
  category: z.enum(['Academic', 'Admission', 'Exam', 'General']).default('General'),
});

export async function GET() {
  try {
    const notices = await prisma.notice.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ success: true, data: notices });
  } catch (error: unknown) {
    console.error('Notices GET error:', error);
    const message = error instanceof Error ? error.message : 'Database connection error';
    return NextResponse.json({ success: false, error: message, data: [] }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = createNoticeSchema.parse(body);

    const notice = await prisma.notice.create({
      data: {
        title: validated.title,
        content: validated.content,
        category: validated.category,
        isPublished: true,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Official notice published successfully.',
      data: notice,
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Notice POST error:', error);
    const zodMsg = (error as { errors?: Array<{ message: string }> })?.errors?.[0]?.message;
    const message = zodMsg || (error instanceof Error ? error.message : 'Failed to publish notice.');
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Notice ID required.' }, { status: 400 });
    }

    await prisma.notice.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Notice deleted.' });
  } catch (error: unknown) {
    console.error('Notice DELETE error:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete notice.';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

