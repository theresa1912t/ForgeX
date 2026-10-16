import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { markAllNotificationsRead } from '@/lib/usecases/notifications/markAllNotificationsRead';

export const POST = withAuth(withErrorHandling(async () => {
  await markAllNotificationsRead();
  return NextResponse.json({ success: true });
}));
