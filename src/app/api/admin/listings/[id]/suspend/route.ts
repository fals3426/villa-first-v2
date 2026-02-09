import { NextRequest, NextResponse } from 'next/server';
import { requireSupport } from '@/lib/middleware/support-guard';
import { fraudManagementService } from '@/server/services/support/fraud-management.service';
import { z } from 'zod';

const suspendListingSchema = z.object({
  reason: z.string().min(10, 'La raison doit contenir au moins 10 caractères').max(1000),
  evidence: z.record(z.string(), z.any()).optional(),
});

/**
 * POST /api/admin/listings/[id]/suspend
 * 
 * Suspend une annonce en cas de fraude (Story 9.5)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSupport();
    const { id: listingId } = await context.params;
    const body = await request.json();
    const validation = suspendListingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await fraudManagementService.suspendListing(
      listingId,
      session.user.id,
      validation.data.reason,
      validation.data.evidence
    );

    return NextResponse.json(
      {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suspension:', error);

    if (error instanceof Error) {
      if (error.message === 'LISTING_NOT_FOUND') {
        return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la suspension' },
      { status: 500 }
    );
  }
}
