import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { listDeviceConnections } from '@/lib/usecases/deviceConnections/listDeviceConnections';
import { addDeviceConnection } from '@/lib/usecases/deviceConnections/addDeviceConnection';

export const GET = withErrorHandling(async () => {
  return NextResponse.json(await listDeviceConnections());
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json();
  const connection = await addDeviceConnection(body);
  return NextResponse.json(connection, { status: 201 });
});
