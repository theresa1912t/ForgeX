import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listIngredientUsageRecords } from '@/lib/usecases/ingredientUsageRecords/listIngredientUsageRecords';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listIngredientUsageRecords());
});
