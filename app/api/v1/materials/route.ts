import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listMaterials } from '@/lib/usecases/materials/listMaterials';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listMaterials());
}));
