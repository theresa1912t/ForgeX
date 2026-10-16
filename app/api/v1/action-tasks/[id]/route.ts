import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { updateActionTask } from '@/lib/usecases/actionTasks/updateActionTask';

export const PATCH = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const { status, assignedTo, assignedRole } = await req.json();
    const task = await updateActionTask(id, { status, assignedTo, assignedRole });
    return NextResponse.json(task);
  },
);
