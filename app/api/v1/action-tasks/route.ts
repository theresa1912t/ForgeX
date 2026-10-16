import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listActionTasks } from '@/lib/usecases/actionTasks/listActionTasks';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listActionTasks());
});
