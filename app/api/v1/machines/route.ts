import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listMachines } from '@/lib/usecases/machines/listMachines';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listMachines());
});
