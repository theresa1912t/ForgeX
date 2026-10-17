import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listNotifications } from '@/lib/usecases/notifications/listNotifications';
import { addNotification } from '@/lib/usecases/notifications/addNotification';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listNotifications());
}));

export const POST = withAuth(withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const notification = await addNotification(body);
  return NextResponse.json(notification, { status: 201 });
}));
