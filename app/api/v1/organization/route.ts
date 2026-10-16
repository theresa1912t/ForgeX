import { NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { getOrganization } from '@/lib/usecases/organization/getOrganization';

export const GET = withAuth(withErrorHandling(async () => {
  const organization = await getOrganization();
  return NextResponse.json(organization);
}));
