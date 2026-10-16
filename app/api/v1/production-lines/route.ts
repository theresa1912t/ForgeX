import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listProductionLines } from '@/lib/usecases/productionLines/listProductionLines';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listProductionLines());
});
