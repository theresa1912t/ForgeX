import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { ingestData } from '@/lib/usecases/dataIngestion/ingestData';

export const POST = withErrorHandling(async (req: NextRequest) => {
  const { datasetType, count, summaryNotes } = await req.json();
  const notification = await ingestData(datasetType, count, summaryNotes);
  return NextResponse.json(notification, { status: 201 });
});
