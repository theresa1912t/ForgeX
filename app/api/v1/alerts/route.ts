import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listAlerts } from '@/lib/usecases/alerts/listAlerts';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listAlerts());
});
