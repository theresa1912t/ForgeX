import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listEnergyRecords } from '@/lib/usecases/energyRecords/listEnergyRecords';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listEnergyRecords());
}));
