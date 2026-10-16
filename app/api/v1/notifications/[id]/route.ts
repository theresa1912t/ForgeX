import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { markNotificationRead } from '@/lib/usecases/notifications/markNotificationRead';

export const PATCH = withAuth(withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const { read } = await req.json();
    const notification = await markNotificationRead(id, read);
    return NextResponse.json(notification);
  },
));
