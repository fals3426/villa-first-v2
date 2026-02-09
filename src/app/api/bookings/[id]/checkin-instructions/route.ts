import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkinInstructionService } from '@/server/services/checkin/checkin-instruction.service';

/**
 * GET /api/bookings/[id]/checkin-instructions
 * 
 * Récupère les instructions de check-in pour une réservation (Story 8.4)
 * Masque les coordonnées sensibles pour les locataires
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: bookingId } = await context.params;
    const instructions = await checkinInstructionService.getInstructionsForBooking(
      bookingId,
      session.user.id
    );

    return NextResponse.json(
      {
        data: instructions,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des instructions:', error);

    if (error instanceof Error) {
      if (error.message === 'BOOKING_NOT_FOUND') {
        return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
      }
      if (error.message === 'NOT_AUTHORIZED') {
        return NextResponse.json(
          { error: 'Vous n\'êtes pas autorisé à voir ces instructions' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des instructions' },
      { status: 500 }
    );
  }
}
