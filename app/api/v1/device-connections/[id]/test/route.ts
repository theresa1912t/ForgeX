import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { testDeviceConnection } from '@/lib/usecases/deviceConnections/testDeviceConnection';

export const POST = withAuth(withErrorHandling(
  async (_req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const connection = await testDeviceConnection(id);
    return NextResponse.json(connection);
  },
), ['Admin']);
