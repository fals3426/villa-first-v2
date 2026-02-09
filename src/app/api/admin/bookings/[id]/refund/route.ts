import { NextRequest, NextResponse } from 'next/server';
import { requireSupport } from '@/lib/middleware/support-guard';
import { refundService } from '@/server/services/support/refund.service';
import { z } from 'zod';

const refundBookingSchema = z.object({
  amount: z.number().min(1).optional(), // Montant en centimes, optionnel (null = total)
  reason: z.string().min(10, 'La raison doit contenir au moins 10 caractères').max(1000),
});

/**
 * POST /api/admin/bookings/[id]/refund
 * 
 * Rembourse un locataire (Story 9.6)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSupport();
    const { id: bookingId } = await context.params;
    const body = await request.json();
    const validation = refundBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await refundService.refundBooking(
      bookingId,
      session.user.id,
      validation.data.amount || null,
      validation.data.reason
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
    console.error('Erreur lors du remboursement:', error);

    if (error instanceof Error) {
      if (error.message === 'BOOKING_NOT_FOUND') {
        return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
      }
      if (error.message === 'NO_CAPTURED_PAYMENT') {
        return NextResponse.json(
          { error: 'Aucun paiement capturé trouvé pour cette réservation' },
          { status: 400 }
        );
      }
      if (error.message === 'REFUND_AMOUNT_EXCEEDS_PAYMENT') {
        return NextResponse.json(
          { error: 'Le montant du remboursement dépasse le montant du paiement' },
          { status: 400 }
        );
      }
      if (error.message === 'REFUND_FAILED') {
        return NextResponse.json(
          { error: 'Le remboursement a échoué' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors du remboursement' },
      { status: 500 }
    );
  }
}
