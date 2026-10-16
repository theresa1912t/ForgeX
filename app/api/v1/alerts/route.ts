import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listAlerts } from '@/lib/usecases/alerts/listAlerts';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listAlerts());
}));
