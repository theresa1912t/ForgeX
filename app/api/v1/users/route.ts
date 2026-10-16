import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listUsers } from '@/lib/usecases/users/listUsers';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listUsers());
});
