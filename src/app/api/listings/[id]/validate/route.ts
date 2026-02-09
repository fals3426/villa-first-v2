import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { validationService } from '@/server/services/bookings/validation.service';

/**
 * POST /api/listings/[id]/validate
 * 
 * Valide manuellement une colocation et capture toutes les préautorisations (Story 5.6, 5.7)
 */
export async function POST(
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
        { error: 'Seuls les hôtes peuvent valider une colocation' },
        { status: 403 }
      );
    }

    const { id: listingId } = await context.params;

    // Valider la colocation
    const result = await validationService.validateColocationManually(
      listingId,
      session.user.id
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
    console.error('Erreur lors de la validation:', error);

    if (error instanceof Error) {
      if (error.message === 'LISTING_NOT_FOUND') {
        return NextResponse.json({ error: 'Annonce introuvable' }, { status: 404 });
      }
      if (error.message === 'LISTING_NOT_OWNED') {
        return NextResponse.json(
          { error: 'Vous n\'avez pas l\'autorisation de valider cette annonce' },
          { status: 403 }
        );
      }
      if (error.message === 'NO_PENDING_BOOKINGS') {
        return NextResponse.json(
          { error: 'Aucune réservation en attente pour cette annonce' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la validation de la colocation' },
      { status: 500 }
    );
  }
}
