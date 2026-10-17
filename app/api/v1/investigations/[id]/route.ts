import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { getInvestigation } from '@/lib/usecases/investigations/getInvestigation';

export const GET = withAuth(withErrorHandling(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const investigation = await getInvestigation(id);
    return NextResponse.json(investigation);
  },
));
