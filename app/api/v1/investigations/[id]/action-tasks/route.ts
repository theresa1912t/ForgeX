import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { createActionTaskFromRecommendation } from '@/lib/usecases/investigations/createActionTaskFromRecommendation';

export const POST = withAuth(withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const { recommendationId, assignedTo, dueDate } = await req.json();
    const task = await createActionTaskFromRecommendation(id, recommendationId, assignedTo, dueDate);
    return NextResponse.json(task, { status: 201 });
  },
), ['Manager', 'Admin']);
