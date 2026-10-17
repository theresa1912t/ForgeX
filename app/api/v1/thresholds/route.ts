import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { getThresholds } from '@/lib/usecases/thresholds/getThresholds';
import { updateThresholds } from '@/lib/usecases/thresholds/updateThresholds';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await getThresholds());
}));

export const PATCH = withAuth(withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const thresholds = await updateThresholds(body);
  return NextResponse.json(thresholds);
}), ['Admin']);
