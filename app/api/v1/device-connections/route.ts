import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { listDeviceConnections } from '@/lib/usecases/deviceConnections/listDeviceConnections';
import { addDeviceConnection } from '@/lib/usecases/deviceConnections/addDeviceConnection';

export const GET = withAuth(withErrorHandling(async () => {
  return NextResponse.json(await listDeviceConnections());
}));

export const POST = withAuth(withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const connection = await addDeviceConnection(body);
  return NextResponse.json(connection, { status: 201 });
}), ['Admin']);
