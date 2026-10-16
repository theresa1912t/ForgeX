import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listMachineProfiles } from '@/lib/usecases/machineProfiles/listMachineProfiles';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listMachineProfiles());
}));
