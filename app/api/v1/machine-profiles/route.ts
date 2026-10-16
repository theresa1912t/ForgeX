import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listMachineProfiles } from '@/lib/usecases/machineProfiles/listMachineProfiles';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listMachineProfiles());
});
