import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { bookingRequestService } from '@/server/services/bookings/booking-request.service';
import { z } from 'zod';

const rejectBookingSchema = z.object({
  reason: z.string().max(500).optional(),
});

/**
 * PATCH /api/host/bookings/[id]/reject
 * 
 * Refuse une demande de réservation (Story 7.2)
 */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    if (session.user.userType !== 'host') {
      return NextResponse.json(
        { error: 'Seuls les hôtes peuvent effectuer cette action' },
        { status: 403 }
      );
    }

    const { id: bookingId } = await context.params;
    const body = await request.json();
    const validation = rejectBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const updatedBooking = await bookingRequestService.rejectBookingRequest(
      session.user.id,
      bookingId,
      validation.data.reason
    );

    return NextResponse.json(
      {
        success: true,
        data: updatedBooking,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors du refus de la demande:', error);

    if (error instanceof Error) {
      if (error.message === 'BOOKING_NOT_FOUND') {
        return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
      }
      if (error.message === 'NOT_AUTHORIZED') {
        return NextResponse.json(
          { error: 'Vous n\'êtes pas autorisé à effectuer cette action' },
          { status: 403 }
        );
      }
      if (error.message === 'BOOKING_NOT_PENDING') {
        return NextResponse.json(
          { error: 'Cette réservation n\'est plus en attente' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors du refus de la demande' },
      { status: 500 }
    );
  }
}
