import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listMaterialBatches } from '@/lib/usecases/materialBatches/listMaterialBatches';
import { addMaterialBatch } from '@/lib/usecases/materialBatches/addMaterialBatch';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listMaterialBatches());
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const batch = await addMaterialBatch(body);
  return NextResponse.json(batch, { status: 201 });
});
