import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listFactories } from '@/lib/usecases/factories/listFactories';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listFactories());
});
