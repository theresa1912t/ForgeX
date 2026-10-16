import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { completeActionTask } from '@/lib/usecases/actionTasks/completeActionTask';

export const POST = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();
    const task = await completeActionTask(id, body);
    return NextResponse.json(task);
  },
);
