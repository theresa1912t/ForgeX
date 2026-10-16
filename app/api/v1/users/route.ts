import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listUsers } from '@/lib/usecases/users/listUsers';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listUsers());
}));
