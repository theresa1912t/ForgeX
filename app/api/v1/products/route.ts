import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listProducts } from '@/lib/usecases/products/listProducts';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listProducts());
}));
