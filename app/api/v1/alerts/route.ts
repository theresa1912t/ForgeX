import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listAlerts } from '@/lib/usecases/alerts/listAlerts';
import { createAlert } from '@/lib/usecases/alerts/createAlert';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listAlerts());
}));

export const POST = withAuth(withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const session = await auth();
  const alert = await createAlert({ ...body, reportedBy: session?.user?.name ?? null });
  return NextResponse.json(alert, { status: 201 });
}), ['Manager', 'Admin']);
