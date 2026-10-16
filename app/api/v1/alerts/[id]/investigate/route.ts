import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { generateInvestigation } from '@/lib/usecases/investigations/generateInvestigation';

export const POST = withAuth(withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const investigation = await generateInvestigation(id);
    return NextResponse.json(investigation, { status: 201 });
  },
), ['Manager', 'Admin']);
