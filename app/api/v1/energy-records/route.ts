import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listEnergyRecords } from '@/lib/usecases/energyRecords/listEnergyRecords';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listEnergyRecords());
});
