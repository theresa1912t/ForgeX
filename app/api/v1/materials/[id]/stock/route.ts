import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withErrorHandling } from '@/lib/server/http';
import { adjustMaterialStock } from '@/lib/usecases/materials/adjustMaterialStock';

export const PATCH = withAuth(withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const { newStock } = await req.json();
    const material = await adjustMaterialStock(id, newStock);
    return NextResponse.json(material);
  },
), ['Manager', 'Admin']);
