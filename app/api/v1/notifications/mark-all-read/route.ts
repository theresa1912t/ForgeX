import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { markAllNotificationsRead } from '@/lib/usecases/notifications/markAllNotificationsRead';

export const POST = withErrorHandling(async () => {
  await markAllNotificationsRead();
  return NextResponse.json({ success: true });
});
