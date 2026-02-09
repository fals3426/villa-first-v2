import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listingService } from '@/server/services/listings/listing.service';
import { createListingSchema } from '@/lib/validations/listing.schema';

/**
 * POST /api/listings
 * Crée une nouvelle annonce (Story 3.1)
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        {
          error: { code: 'UNAUTHORIZED', message: 'Non authentifié' },
        },
        { status: 401 }
      );
    }

    if (session.user.userType !== 'host') {
      return NextResponse.json(
        {
          error: {
            code: 'FORBIDDEN',
            message: 'Seuls les hôtes peuvent créer des annonces',
          },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = createListingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Données invalides',
            details: validation.error.issues,
          },
        },
        { status: 400 }
      );
    }

    try {
      const listing = await listingService.createListing(
        session.user.id,
        validation.data
      );

      return NextResponse.json(
        {
          data: listing,
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'HOST_KYC_NOT_VERIFIED') {
          return NextResponse.json(
            {
              error: {
                code: 'HOST_KYC_NOT_VERIFIED',
                message:
                  'Votre KYC doit être vérifié avant de pouvoir créer des annonces.',
              },
            },
            { status: 403 }
          );
        }

        if (error.message === 'USER_NOT_HOST') {
          return NextResponse.json(
            {
              error: {
                code: 'FORBIDDEN',
                message: 'Seuls les hôtes peuvent créer des annonces',
              },
            },
            { status: 403 }
          );
        }
      }

      throw error;
    }
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Une erreur est survenue lors de la création de l\'annonce',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/listings
 * Liste les annonces (pour hôte: ses annonces, pour locataire: annonces publiées)
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const hostId = searchParams.get('hostId');

    // Si hostId fourni et utilisateur est le propriétaire, retourner ses annonces
    if (hostId && session?.user?.id === hostId && session.user.userType === 'host') {
      const listings = await listingService.getListingsByHost(hostId);
      return NextResponse.json({
        data: listings,
        meta: { timestamp: new Date().toISOString() },
      });
    }

    // Sinon, retourner les annonces publiées (pour recherche - sera complété dans Epic 4)
    // Pour l'instant, retourner vide ou toutes les annonces publiées
    return NextResponse.json({
      data: [],
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error fetching listings:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Une erreur est survenue',
        },
      },
      { status: 500 }
    );
  }
}
