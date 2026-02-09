import { prisma } from '@/lib/prisma';

export interface MapListing {
  id: string;
  title: string;
  pricePerPlace: number | null;
  latitude: number;
  longitude: number;
  mainPhotoUrl: string | null;
  isVerified: boolean;
  address: string;
  location: string | null;
}

export interface MapListingsFilters {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  vibes?: string[];
}

/**
 * Service de géolocalisation pour les annonces (Story 4.4)
 * Récupère les listings avec coordonnées géographiques pour affichage sur carte
 */
export const geolocationService = {
  /**
   * Récupère les listings avec coordonnées géographiques pour la carte
   * Retourne uniquement les listings ayant latitude et longitude non null
   */
  async getListingsWithCoordinates(
    filters: MapListingsFilters = {}
  ): Promise<MapListing[]> {
    // Construire les conditions de filtrage (similaire à searchListings)
    const where: any = {
      status: 'published',
      latitude: { not: null },
      longitude: { not: null },
    };

    // Filtre par localisation
    if (filters.location) {
      const locationSearch = filters.location.trim();
      where.OR = [
        { address: { contains: locationSearch, mode: 'insensitive' } },
        { location: { contains: locationSearch, mode: 'insensitive' } },
      ];
    }

    // Filtre par prix
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.pricePerPlace = {};
      if (filters.minPrice !== undefined) {
        where.pricePerPlace.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.pricePerPlace.lte = filters.maxPrice;
      }
    }

    // Récupérer les listings avec leurs relations nécessaires
    const listings = await prisma.listing.findMany({
      where,
      include: {
        photos: {
          orderBy: { position: 'asc' },
          take: 1, // Première photo pour l'aperçu
        },
        verificationRequests: {
          where: {
            status: 'approved',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Filtrer par vibes si demandé (recherche dans rules et charter)
    let filteredListings = listings;
    const selectedVibes = filters.vibes || [];
    if (selectedVibes.length > 0) {
      filteredListings = listings.filter((listing) => {
        const rulesStr = JSON.stringify(listing.rules || {}).toLowerCase();
        const charterStr = (listing.charter || '').toLowerCase();
        const combinedText = `${rulesStr} ${charterStr}`;

        return selectedVibes.some((vibe) =>
          combinedText.includes(vibe.toLowerCase())
        );
      });
    }

    // Transformer en format optimisé pour la carte
    return filteredListings
      .filter((listing) => listing.latitude !== null && listing.longitude !== null)
      .map((listing) => ({
        id: listing.id,
        title: listing.title,
        pricePerPlace: listing.pricePerPlace,
        latitude: listing.latitude!,
        longitude: listing.longitude!,
        mainPhotoUrl: listing.photos[0]?.url || null,
        isVerified: listing.verificationRequests.length > 0,
        address: listing.address,
        location: listing.location,
      }));
  },
};
