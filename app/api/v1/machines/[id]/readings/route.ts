import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { getMachineReadings } from '@/lib/usecases/machines/getMachineReadings';

export const GET = withAuth(withErrorHandling(
  async (_req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const readings = await getMachineReadings(id);
    return NextResponse.json(readings);
  },
));
