import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { resetDemoState } from '@/lib/usecases/demo/resetDemoState';

export const POST = withErrorHandling(async () => {
  await resetDemoState();
  return NextResponse.json({ success: true });
});
