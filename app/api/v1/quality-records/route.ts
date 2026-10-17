import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listQualityRecords } from '@/lib/usecases/qualityRecords/listQualityRecords';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listQualityRecords());
}));
