import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listFactories } from '@/lib/usecases/factories/listFactories';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listFactories());
}));
