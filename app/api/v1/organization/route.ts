import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/lib/server/http';
import { getOrganization } from '@/lib/usecases/organization/getOrganization';

export const GET = withErrorHandling(async () => {
  const organization = await getOrganization();
  return NextResponse.json(organization);
});
