import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { simulateFailure } from '@/lib/usecases/alerts/simulateFailure';

export const POST = withAuth(withErrorHandling(async (req: NextRequest) => {
  const { machineId, scenario } = await req.json();
  const alert = await simulateFailure(machineId, scenario);
  return NextResponse.json(alert, { status: 201 });
}), ['Manager', 'Admin']);
