import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listingService } from '@/server/services/listings/listing.service';
import { bookingService } from '@/server/services/bookings/booking.service';
import { updatePriceSchema } from '@/lib/validations/price.schema';

/**
 * PATCH /api/listings/[id]/price
 * Met à jour le prix d'une annonce (Story 3.9)
 */
export async function PATCH(
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
    const body = await request.json();

    // Valider les données
    const validation = updatePriceSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Récupérer l'ancien prix avant la mise à jour
    const oldListing = await listingService.getListingById(listingId);
    const oldPrice = oldListing?.pricePerPlace ?? 0;

    // Mettre à jour l'annonce
    const listing = await listingService.updateListing(
      listingId,
      session.user.id,
      { pricePerPlace: validation.data.pricePerPlace }
    );

    // Gérer le changement de prix pour les réservations en attente (Story 5.2)
    if (oldPrice !== validation.data.pricePerPlace) {
      await bookingService.handlePriceChange(listingId, validation.data.pricePerPlace);
    }

    return NextResponse.json(
      {
        data: listing,
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error updating listing price:', error);

    if (
      error.message === 'LISTING_NOT_FOUND' ||
      error.message === 'LISTING_NOT_OWNED'
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === 'LISTING_NOT_FOUND' ? 404 : 403 }
      );
    }

    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
