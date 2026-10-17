import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listMachines } from '@/lib/usecases/machines/listMachines';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listMachines());
}));
