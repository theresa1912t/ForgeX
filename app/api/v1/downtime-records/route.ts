import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listDowntimeRecords } from '@/lib/usecases/downtimeRecords/listDowntimeRecords';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listDowntimeRecords());
}));
