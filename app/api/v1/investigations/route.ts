import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listInvestigations } from '@/lib/usecases/investigations/listInvestigations';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listInvestigations());
});
