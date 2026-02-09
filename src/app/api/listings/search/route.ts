import { NextRequest, NextResponse } from 'next/server';
import { listingService } from '@/server/services/listings/listing.service';
import { searchListingsSchema } from '@/lib/validations/search.schema';

/**
 * GET /api/listings/search
 * Recherche d'annonces avec filtres (Story 4.1, 4.5)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extraire les paramètres de recherche
    const params = {
      location: searchParams.get('location') || undefined,
      minPrice: searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined,
      maxPrice: searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined,
      vibes: searchParams.get('vibes')?.split(',').filter(Boolean) || undefined,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
    };

    // Valider les paramètres
    const validation = searchListingsSchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Rechercher les annonces
    const result = await listingService.searchListings(validation.data);

    return NextResponse.json(
      {
        data: result.listings,
        meta: {
          pagination: result.pagination,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error searching listings:', error);
    return NextResponse.json(
      { error: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
