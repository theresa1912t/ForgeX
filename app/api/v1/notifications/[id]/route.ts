import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { markNotificationRead } from '@/lib/usecases/notifications/markNotificationRead';

export const PATCH = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const { read } = await req.json();
    const notification = await markNotificationRead(id, read);
    return NextResponse.json(notification);
  },
);
