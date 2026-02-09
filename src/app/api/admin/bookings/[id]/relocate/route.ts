import { NextRequest, NextResponse } from 'next/server';
import { requireSupport } from '@/lib/middleware/support-guard';
import { relocationService } from '@/server/services/support/relocation.service';
import { z } from 'zod';

const relocateBookingSchema = z.object({
  newListingId: z.string().min(1),
  autoRefund: z.boolean().optional().default(false),
});

/**
 * POST /api/admin/bookings/[id]/relocate
 * 
 * Propose un relogement à un locataire (Story 9.7)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSupport();
    const { id: bookingId } = await context.params;
    const body = await request.json();
    const validation = relocateBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await relocationService.proposeRelocation(
      bookingId,
      validation.data.newListingId,
      session.user.id,
      validation.data.autoRefund
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
    console.error('Erreur lors du relogement:', error);

    if (error instanceof Error) {
      if (error.message === 'BOOKING_NOT_FOUND') {
        return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
      }
      if (error.message === 'NEW_LISTING_NOT_FOUND') {
        return NextResponse.json({ error: 'Nouvelle annonce introuvable' }, { status: 404 });
      }
      if (error.message === 'NEW_LISTING_NOT_AVAILABLE') {
        return NextResponse.json(
          { error: 'La nouvelle annonce n\'est pas disponible' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors du relogement' },
      { status: 500 }
    );
  }
}
