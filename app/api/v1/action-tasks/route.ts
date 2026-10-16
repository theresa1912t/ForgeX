import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listActionTasks } from '@/lib/usecases/actionTasks/listActionTasks';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listActionTasks());
}));
