import { NextRequest, NextResponse } from 'next/server';
import { listingService } from '@/server/services/listings/listing.service';
import { compareListingsSchema } from '@/lib/validations/compare.schema';

/**
 * GET /api/listings/compare?ids=id1,id2,id3
 * 
 * Récupère les listings pour comparaison (Story 4.6)
 * 
 * Query parameters:
 * - ids: string - Liste d'IDs séparés par des virgules (2-5 annonces)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
      return NextResponse.json(
        { error: 'Le paramètre ids est requis' },
        { status: 400 }
      );
    }

    // Parser les IDs
    const ids = idsParam.split(',').map((id) => id.trim()).filter(Boolean);

    // Valider
    const validation = compareListingsSchema.safeParse({ ids });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Paramètres invalides', issues: validation.error.issues },
        { status: 400 }
      );
    }

    // Récupérer les listings
    const listings = await listingService.getListingsByIds(validation.data.ids);

    if (listings.length < 2) {
      return NextResponse.json(
        { error: 'Au moins 2 annonces publiées sont requises pour la comparaison' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: listings,
      count: listings.length,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des listings pour comparaison:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des listings pour comparaison' },
      { status: 500 }
    );
  }
}
