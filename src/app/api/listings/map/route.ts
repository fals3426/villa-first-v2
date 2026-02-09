import { NextRequest, NextResponse } from 'next/server';
import { geolocationService } from '@/server/services/listings/geolocation.service';
import { searchListingsSchema } from '@/lib/validations/search.schema';

/**
 * GET /api/listings/map
 * 
 * Récupère les listings avec coordonnées géographiques pour affichage sur carte (Story 4.4)
 * 
 * Query parameters:
 * - location?: string - Recherche par localisation
 * - minPrice?: number - Prix minimum
 * - maxPrice?: number - Prix maximum
 * - vibes?: string - Liste de vibes séparés par virgules
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parser les paramètres de recherche
    const rawParams = {
      location: searchParams.get('location') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      vibes: searchParams.get('vibes') || undefined,
    };

    // Valider les paramètres
    const validation = searchListingsSchema.safeParse({
      ...rawParams,
      vibes: rawParams.vibes ? rawParams.vibes.split(',').filter(Boolean) : undefined,
      page: 1,
      limit: 1000, // Pas de pagination pour la carte, mais limiter à 1000 pour performance
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Paramètres de recherche invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    const filters = {
      location: validation.data.location,
      minPrice: validation.data.minPrice,
      maxPrice: validation.data.maxPrice,
      vibes: validation.data.vibes,
    };

    // Récupérer les listings avec coordonnées
    const listings = await geolocationService.getListingsWithCoordinates(filters);

    return NextResponse.json({
      success: true,
      data: listings,
      count: listings.length,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des listings pour la carte:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des listings pour la carte' },
      { status: 500 }
    );
  }
}
