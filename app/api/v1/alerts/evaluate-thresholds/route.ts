import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { evaluateVibrationThresholds } from '@/lib/usecases/alerts/evaluateVibrationThresholds';

export const POST = withAuth(withErrorHandling(async () => {
  const result = await evaluateVibrationThresholds();
  return NextResponse.json(result);
}), ['Manager', 'Admin']);
