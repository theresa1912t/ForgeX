import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listDowntimeRecords } from '@/lib/usecases/downtimeRecords/listDowntimeRecords';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listDowntimeRecords());
});
