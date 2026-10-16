import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listMaterials } from '@/lib/usecases/materials/listMaterials';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listMaterials());
});
