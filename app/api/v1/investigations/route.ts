import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listInvestigations } from '@/lib/usecases/investigations/listInvestigations';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listInvestigations());
}));
