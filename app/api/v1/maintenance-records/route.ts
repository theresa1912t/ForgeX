import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listMaintenanceRecords } from '@/lib/usecases/maintenanceRecords/listMaintenanceRecords';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listMaintenanceRecords());
}));
