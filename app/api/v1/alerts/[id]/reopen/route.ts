import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { reopenAlert } from '@/lib/usecases/alerts/reopenAlert';

export const POST = withAuth(withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const session = await auth();
    const alert = await reopenAlert(id, {
      reason: body.reason ?? '',
      actorName: session?.user?.name ?? null,
    });
    return NextResponse.json(alert);
  },
), ['Manager', 'Admin']);
