import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listWasteRecords } from '@/lib/usecases/wasteRecords/listWasteRecords';
import { addWasteRecord } from '@/lib/usecases/wasteRecords/addWasteRecord';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listWasteRecords());
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const record = await addWasteRecord(body);
  return NextResponse.json(record, { status: 201 });
});
