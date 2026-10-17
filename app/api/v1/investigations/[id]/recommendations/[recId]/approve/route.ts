import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { approveRecommendation } from '@/lib/usecases/investigations/approveRecommendation';

export const POST = withAuth(withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string; recId: string }> }) => {
    const { id, recId } = await params;
    const result = await approveRecommendation(id, recId);
    return NextResponse.json(result);
  },
), ['Manager', 'Admin']);
