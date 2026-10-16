import { NextRequest, NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { updateMachineProfileGateway } from '@/lib/usecases/machineProfiles/updateMachineProfileGateway';

export const PATCH = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ machineId: string }> }) => {
    const { machineId } = await params;
    const { gatewayId } = await req.json();
    const profile = await updateMachineProfileGateway(machineId, gatewayId);
    return NextResponse.json(profile);
  },
);
