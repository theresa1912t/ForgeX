import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listQualityRecords } from '@/lib/usecases/qualityRecords/listQualityRecords';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listQualityRecords());
});
