import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { watchlistService } from '@/server/services/listings/watchlist.service';

/**
 * GET /api/watchlist
 * 
 * Récupère la liste des annonces suivies par l'utilisateur (Story 6.8)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const watchlist = await watchlistService.getUserWatchlist(session.user.id);

    return NextResponse.json(
      {
        data: watchlist,
        meta: {
          count: watchlist.length,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération de la watchlist:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la watchlist' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/watchlist
 * 
 * Ajoute une annonce à la liste de suivi (Story 6.8)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { listingId } = body;

    if (!listingId || typeof listingId !== 'string') {
      return NextResponse.json(
        { error: 'ID d\'annonce requis' },
        { status: 400 }
      );
    }

    const watched = await watchlistService.addToWatchlist(session.user.id, listingId);

    return NextResponse.json(
      {
        success: true,
        data: watched,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'ajout à la watchlist:', error);

    if (error instanceof Error) {
      if (error.message === 'ONLY_TENANTS_CAN_WATCH') {
        return NextResponse.json(
          { error: 'Seuls les locataires peuvent suivre des annonces' },
          { status: 403 }
        );
      }
      if (error.message === 'LISTING_NOT_FOUND_OR_NOT_PUBLISHED') {
        return NextResponse.json(
          { error: 'Annonce introuvable ou non publiée' },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de l\'ajout à la watchlist' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/watchlist
 * 
 * Retire une annonce de la liste de suivi (Story 6.8)
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get('listingId');

    if (!listingId) {
      return NextResponse.json(
        { error: 'Paramètre listingId requis' },
        { status: 400 }
      );
    }

    await watchlistService.removeFromWatchlist(session.user.id, listingId);

    return NextResponse.json(
      {
        success: true,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la suppression de la watchlist:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la watchlist' },
      { status: 500 }
    );
  }
}
