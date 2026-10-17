import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { resetDemoState } from '@/lib/usecases/demo/resetDemoState';

export const POST = withAuth(withErrorHandling(async () => {
  await resetDemoState();
  return NextResponse.json({ success: true });
}), ['Admin']);
