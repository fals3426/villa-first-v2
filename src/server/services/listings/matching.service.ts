import { prisma } from '@/lib/prisma';

interface UserPreferences {
  budget?: { min?: number; max?: number };
  location?: string;
  vibesPreferences?: Record<string, unknown>;
}

interface ListingMatch {
  listingId: string;
  title: string;
  location: string | null;
  pricePerPlace: number | null;
  matchScore: number;
  matchReasons: string[];
}

/**
 * Service pour le matching d'annonces avec les préférences utilisateur (Story 6.7)
 */
export const matchingService = {
  /**
   * Vérifie si une annonce correspond aux critères d'un utilisateur (Story 6.7)
   */
  async matchesUserCriteria(
    listingId: string,
    userId: string
  ): Promise<{ matches: boolean; score: number; reasons: string[] }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        vibesPreferences: true,
        userType: true,
      },
    });

    if (!user || user.userType !== 'tenant') {
      return { matches: false, score: 0, reasons: [] };
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        location: true,
        pricePerPlace: true,
        rules: true,
        charter: true,
        status: true,
        capacity: true,
        availability: {
          where: {
            isAvailable: true,
            startDate: { gte: new Date() },
          },
          take: 1,
        },
      },
    });

    if (!listing || listing.status !== 'published') {
      return { matches: false, score: 0, reasons: [] };
    }

    // Vérifier qu'il y a au moins une disponibilité
    if (listing.availability.length === 0) {
      return { matches: false, score: 0, reasons: ['Aucune disponibilité'] };
    }

    const reasons: string[] = [];
    let score = 0;

    // Matching par prix (si préférences budget définies)
    // Note: Les préférences budget ne sont pas encore dans le modèle User
    // On peut les ajouter plus tard ou utiliser vibesPreferences
    const userVibes = user.vibesPreferences as Record<string, unknown> | null;
    if (userVibes && typeof userVibes === 'object' && 'budgetMax' in userVibes && listing.pricePerPlace !== null) {
      const budgetMax = userVibes.budgetMax as number;
      if (budgetMax && listing.pricePerPlace <= budgetMax * 100) {
        // budgetMax en euros, pricePerPlace en centimes
        score += 30;
        reasons.push('Dans votre budget');
      }
    }

    // Matching par vibes (si préférences définies)
    // Les vibes sont stockés dans rules et charter, on les compare avec les préférences utilisateur
    if (userVibes) {
      const listingText = `${JSON.stringify(listing.rules || {})} ${listing.charter || ''}`.toLowerCase();
      const userVibesKeys = Object.keys(userVibes);
      const matchingVibes = userVibesKeys.filter((key) => {
        const vibeValue = userVibes[key];
        if (typeof vibeValue === 'string' || typeof vibeValue === 'boolean') {
          return listingText.includes(key.toLowerCase()) || listingText.includes(String(vibeValue).toLowerCase());
        }
        return false;
      });
      if (matchingVibes.length > 0) {
        score += matchingVibes.length * 10;
        reasons.push(`Correspond à ${matchingVibes.length} de vos préférences`);
      }
    }

    // Bonus pour annonces récentes
    const listingAge = new Date().getTime() - new Date(listing.id).getTime();
    if (listingAge < 7 * 24 * 60 * 60 * 1000) {
      // Moins de 7 jours
      score += 10;
      reasons.push('Annonce récente');
    }

    // Score minimum pour considérer comme match
    const matches = score >= 20;

    return { matches, score, reasons };
  },

  /**
   * Trouve toutes les nouvelles annonces correspondant aux critères d'un utilisateur (Story 6.7)
   */
  async findMatchingListings(userId: string, since?: Date): Promise<ListingMatch[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        vibesPreferences: true,
        userType: true,
      },
    });

    if (!user || user.userType !== 'tenant') {
      return [];
    }

    // Récupérer les annonces publiées récemment
    const where: any = {
      status: 'published',
    };

    if (since) {
      where.createdAt = { gte: since };
    } else {
      // Par défaut, vérifier les 24 dernières heures
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      where.createdAt = { gte: yesterday };
    }

    const listings = await prisma.listing.findMany({
      where,
      include: {
        availability: {
          where: {
            isAvailable: true,
            startDate: { gte: new Date() },
          },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const matches: ListingMatch[] = [];

    for (const listing of listings) {
      // Vérifier qu'il y a une disponibilité
      if (listing.availability.length === 0) {
        continue;
      }

      const match = await this.matchesUserCriteria(listing.id, userId);
      if (match.matches) {
        matches.push({
          listingId: listing.id,
          title: listing.title,
          location: listing.location,
          pricePerPlace: listing.pricePerPlace,
          matchScore: match.score,
          matchReasons: match.reasons,
        });
      }
    }

    // Trier par score décroissant
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return matches;
  },
};
