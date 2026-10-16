import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listProductionLines } from '@/lib/usecases/productionLines/listProductionLines';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listProductionLines());
}));
