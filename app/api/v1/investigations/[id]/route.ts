import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { getInvestigation } from '@/lib/usecases/investigations/getInvestigation';

export const GET = withErrorHandling(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const investigation = await getInvestigation(id);
    return NextResponse.json(investigation);
  },
);
