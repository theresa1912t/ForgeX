import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listProducts } from '@/lib/usecases/products/listProducts';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listProducts());
});
