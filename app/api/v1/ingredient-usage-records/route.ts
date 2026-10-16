import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listIngredientUsageRecords } from '@/lib/usecases/ingredientUsageRecords/listIngredientUsageRecords';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listIngredientUsageRecords());
}));
