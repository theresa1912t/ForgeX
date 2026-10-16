import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listMaintenanceRecords } from '@/lib/usecases/maintenanceRecords/listMaintenanceRecords';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listMaintenanceRecords());
});
