import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listingService } from '@/server/services/listings/listing.service';
import { updateListingSchema } from '@/lib/validations/listing.schema';

/**
 * GET /api/listings/[id]
 * Récupère le détail d'une annonce
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const listing = await listingService.getListingById(id);

    if (!listing) {
      return NextResponse.json(
        {
          error: { code: 'NOT_FOUND', message: 'Annonce non trouvée' },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: listing,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error fetching listing:', error);
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

/**
 * PUT /api/listings/[id]
 * Met à jour une annonce (Story 3.1, 3.6, 3.9)
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
            message: 'Seuls les hôtes peuvent modifier des annonces',
          },
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const validation = updateListingSchema.safeParse(body);

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
      const updated = await listingService.updateListing(
        id,
        session.user.id,
        validation.data
      );

      return NextResponse.json({
        data: updated,
        meta: { timestamp: new Date().toISOString() },
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'LISTING_NOT_FOUND') {
          return NextResponse.json(
            {
              error: {
                code: 'NOT_FOUND',
                message: 'Annonce non trouvée',
              },
            },
            { status: 404 }
          );
        }

        if (error.message === 'LISTING_NOT_OWNED') {
          return NextResponse.json(
            {
              error: {
                code: 'FORBIDDEN',
                message: 'Vous n\'êtes pas propriétaire de cette annonce',
              },
            },
            { status: 403 }
          );
        }
      }

      throw error;
    }
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Une erreur est survenue lors de la mise à jour',
        },
      },
      { status: 500 }
    );
  }
}
