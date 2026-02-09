import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listingService } from '@/server/services/listings/listing.service';
import { completenessService } from '@/server/services/listings/completeness.service';
import { MIN_LISTING_COMPLETENESS_SCORE } from '@/lib/constants';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/listings/[id]/publish
 * Publie une annonce (Story 3.5)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Vérifier le rôle hôte
    if (session.user.userType !== 'host') {
      return NextResponse.json(
        { error: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    const { id: listingId } = await context.params;

    try {
      // Publier l'annonce (vérifie le score et l'ownership)
      const listing = await listingService.publishListing(listingId, session.user.id);

      return NextResponse.json(
        {
          data: listing,
          meta: { timestamp: new Date().toISOString() },
        },
        { status: 200 }
      );
    } catch (error: any) {
      if (error.message === 'INSUFFICIENT_COMPLETENESS_SCORE') {
        // Récupérer les détails de complétude pour le feedback
        const listing = await prisma.listing.findUnique({
          where: { id: listingId },
          include: {
            photos: true,
            availability: {
              where: { isAvailable: true },
            },
          },
        });

        if (!listing) {
          return NextResponse.json(
            { error: 'LISTING_NOT_FOUND' },
            { status: 404 }
          );
        }

        const missingSections = completenessService.getMissingSections({
          title: listing.title,
          description: listing.description,
          address: listing.address,
          pricePerPlace: listing.pricePerPlace,
          rules: listing.rules,
          charter: listing.charter,
          photos: listing.photos,
          availability: listing.availability,
        });

        return NextResponse.json(
          {
            error: {
              code: 'COMPLETENESS_TOO_LOW',
              message: `Le score de complétude (${listing.completenessScore}%) est insuffisant pour publier l'annonce. Minimum requis : ${MIN_LISTING_COMPLETENESS_SCORE}%.`,
              details: {
                currentScore: listing.completenessScore,
                minScore: MIN_LISTING_COMPLETENESS_SCORE,
                missingSections,
              },
            },
          },
          { status: 400 }
        );
      }

      if (
        error.message === 'LISTING_NOT_FOUND' ||
        error.message === 'LISTING_NOT_OWNED'
      ) {
        return NextResponse.json(
          { error: error.message },
          { status: error.message === 'LISTING_NOT_FOUND' ? 404 : 403 }
        );
      }

      throw error;
    }
  } catch (error: any) {
    console.error('Error publishing listing:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
