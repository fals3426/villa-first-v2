import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { auditService } from '@/server/services/audit/audit.service';
import { kycService } from '@/server/services/kyc/kyc.service';
import { completenessService } from '@/server/services/listings/completeness.service';
import { MIN_LISTING_COMPLETENESS_SCORE } from '@/lib/constants';
import type { CreateListingInput, UpdateListingInput } from '@/types/listing.types';

export const listingService = {
  /**
   * Crée une nouvelle annonce (Story 3.1)
   */
  async createListing(hostId: string, data: CreateListingInput) {
    // Vérifier que l'utilisateur est bien KYC vérifié
    const isKycVerified = await kycService.checkKycVerified(hostId);
    if (!isKycVerified) {
      throw new Error('HOST_KYC_NOT_VERIFIED');
    }

    // Vérifier que l'utilisateur est bien un hôte
    const user = await prisma.user.findUnique({
      where: { id: hostId },
      select: { userType: true },
    });

    if (!user || user.userType !== 'host') {
      throw new Error('USER_NOT_HOST');
    }

    const listing = await prisma.listing.create({
      data: {
        hostId,
        title: data.title,
        description: data.description,
        address: data.address,
        location: data.location || null,
        capacity: data.capacity,
        listingType: data.listingType,
        status: 'draft',
        completenessScore: 0,
      },
    });

    // Calculer le score de complétude initial
    await completenessService.recalculateAndPersistCompleteness(listing.id);

    // Audit
    await auditService.logAction(
      hostId,
      'listing_created',
      'listing',
      listing.id,
      {
        title: listing.title,
        status: listing.status,
      }
    );

    // Recharger avec le score calculé
    return prisma.listing.findUnique({
      where: { id: listing.id },
    });
  },

  /**
   * Récupère une annonce par ID
   */
  async getListingById(listingId: string) {
    return prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        host: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
          },
        },
        photos: {
          orderBy: { position: 'asc' },
        },
        availability: {
          where: { isAvailable: true },
          orderBy: { startDate: 'asc' },
        },
        verificationRequests: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        bookings: {
          where: {
            status: {
              in: ['confirmed', 'accepted'], // Réservations confirmées/acceptées
            },
          },
          include: {
            tenant: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePictureUrl: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  },

  /**
   * Récupère toutes les annonces d'un hôte
   */
  async getListingsByHost(hostId: string) {
    return prisma.listing.findMany({
      where: { hostId },
      orderBy: { createdAt: 'desc' },
      include: {
        photos: {
          orderBy: { position: 'asc' },
          take: 1, // Première photo pour aperçu
        },
      },
    });
  },

  /**
   * Met à jour une annonce (Story 3.1, 3.6, 3.9)
   */
  async updateListing(
    listingId: string,
    hostId: string,
    data: UpdateListingInput
  ) {
    // Vérifier l'ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hostId: true },
    });

    if (!listing) {
      throw new Error('LISTING_NOT_FOUND');
    }

    if (listing.hostId !== hostId) {
      throw new Error('LISTING_NOT_OWNED');
    }

    // Préparer les données de mise à jour
    const updateData: Prisma.ListingUpdateInput = {
      updatedAt: new Date(),
    };

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.location !== undefined) updateData.location = data.location || null;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    if (data.listingType !== undefined) updateData.listingType = data.listingType;
    if (data.pricePerPlace !== undefined) updateData.pricePerPlace = data.pricePerPlace;
    if (data.rules !== undefined) updateData.rules = data.rules as Prisma.InputJsonValue;
    if (data.charter !== undefined) updateData.charter = data.charter;

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: updateData,
    });

    // Recalculer le score de complétude après mise à jour
    await completenessService.recalculateAndPersistCompleteness(listingId);

    // Audit
    await auditService.logAction(
      hostId,
      'listing_updated',
      'listing',
      listingId,
      {
        updatedFields: Object.keys(data),
      }
    );

    // Recharger avec le score calculé
    return prisma.listing.findUnique({
      where: { id: listingId },
    });
  },

  /**
   * Publie une annonce (Story 3.5)
   */
  async publishListing(listingId: string, hostId: string) {
    // Vérifier l'ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hostId: true, completenessScore: true },
    });

    if (!listing) {
      throw new Error('LISTING_NOT_FOUND');
    }

    if (listing.hostId !== hostId) {
      throw new Error('LISTING_NOT_OWNED');
    }

    // Recalculer le score avant vérification (au cas où il serait obsolète)
    const currentScore = await completenessService.recalculateAndPersistCompleteness(listingId);
    
    // Vérifier le score de complétude (minimum 80%)
    if (currentScore < MIN_LISTING_COMPLETENESS_SCORE) {
      throw new Error('INSUFFICIENT_COMPLETENESS_SCORE');
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: 'published',
        updatedAt: new Date(),
      },
    });

    // Audit
    await auditService.logAction(
      hostId,
      'listing_published',
      'listing',
      listingId,
      {
        completenessScore: listing.completenessScore,
      }
    );

    return updated;
  },

  /**
   * Recherche d'annonces avec filtres (Story 4.1, 4.5)
   */
  async searchListings(filters: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    vibes?: string[];
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    // Construire les conditions de filtrage
    const where: any = {
      status: 'published', // Seulement les annonces publiées
    };

    // Filtre par localisation (recherche textuelle sur address et location)
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

    // Note: Le filtre par vibes sera appliqué après récupération car Prisma ne supporte pas
    // facilement la recherche dans des champs JSON avec des conditions complexes
    // Pour le MVP, on filtre en mémoire après récupération

    // Compter le total avant pagination (sans filtre vibes pour l'instant)
    const total = await prisma.listing.count({ where });

    // Si aucun résultat, retourner directement sans faire de requête avec relations
    // Cela évite les requêtes problématiques avec IN (NULL) quand la base est vide
    if (total === 0) {
      return {
        listings: [],
        pagination: {
          total: 0,
          page,
          limit,
          totalPages: 0,
        },
      };
    }

    // Récupérer les annonces avec leurs relations nécessaires
    const listings = await prisma.listing.findMany({
      where,
      skip,
      take: limit,
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
          },
        },
        photos: {
          orderBy: { position: 'asc' },
          take: 1, // Première photo pour l'aperçu
        },
        verificationRequests: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Dernière demande de vérification
        },
      },
      orderBy: [
        // Tri par pertinence : vérifiées en premier
        // On va trier après avoir récupéré les données car Prisma ne supporte pas facilement
        // le tri conditionnel basé sur une relation
        { completenessScore: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Filtrer par vibes si demandé (recherche dans rules et charter)
    let filteredListings = listings;
    const selectedVibes = filters.vibes || [];
    if (selectedVibes.length > 0) {
      filteredListings = listings.filter((listing) => {
        // Rechercher les vibes dans les règles (rules JSON) et la charte
        const rulesStr = listing.rules ? JSON.stringify(listing.rules).toLowerCase() : '';
        const charterStr = (listing.charter || '').toLowerCase();
        const combinedText = `${rulesStr} ${charterStr}`;

        // Vérifier si au moins un des vibes sélectionnés est présent
        // Mapping simplifié : calm, social, spiritual, remote
        const vibeKeywords: Record<string, string[]> = {
          calm: ['calme', 'tranquille', 'repos', 'zen', 'peaceful'],
          social: ['social', 'festif', 'fête', 'party', 'convivial'],
          spiritual: ['spiritualité', 'spiritual', 'méditation', 'yoga', 'wellness'],
          remote: ['télétravail', 'remote', 'work', 'travail', 'bureau'],
        };

        return selectedVibes.some((vibe) => {
          const keywords = vibeKeywords[vibe.toLowerCase()] || [];
          return keywords.some((keyword) => combinedText.includes(keyword));
        });
      });
    }

    // Trier par pertinence : annonces vérifiées en premier
    const sortedListings = filteredListings.sort((a, b) => {
      const aVerified = a.verificationRequests[0]?.status === 'approved' ? 1 : 0;
      const bVerified = b.verificationRequests[0]?.status === 'approved' ? 1 : 0;
      
      if (aVerified !== bVerified) {
        return bVerified - aVerified; // Vérifiées en premier
      }
      
      // Puis par score de complétude
      const aScore = a.completenessScore || 0;
      const bScore = b.completenessScore || 0;
      if (aScore !== bScore) {
        return bScore - aScore;
      }
      
      // Puis par date de création (plus récentes en premier)
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

    // Recalculer le total après filtrage vibes
    const finalTotal = selectedVibes.length > 0 
      ? sortedListings.length 
      : total;

    return {
      listings: sortedListings,
      pagination: {
        page,
        limit,
        total: finalTotal,
        totalPages: Math.ceil(finalTotal / limit),
      },
    };
  },

  /**
   * Récupère plusieurs listings par leurs IDs pour comparaison (Story 4.6)
   * Retourne uniquement les listings publiés avec données optimisées
   */
  async getListingsByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    // Limiter à MAX_COMPARISONS pour éviter surcharge
    const limitedIds = ids.slice(0, 5);

    const listings = await prisma.listing.findMany({
      where: {
        id: { in: limitedIds },
        status: 'published', // Seulement les annonces publiées
      },
      include: {
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
          },
        },
        photos: {
          orderBy: { position: 'asc' },
          take: 1, // Première photo pour comparaison
        },
        verificationRequests: {
          where: {
            status: 'approved',
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      // Préserver l'ordre des IDs fournis
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Réordonner selon l'ordre des IDs fournis
    const orderedListings = limitedIds
      .map((id) => listings.find((listing) => listing.id === id))
      .filter((listing): listing is NonNullable<typeof listing> => listing !== undefined);

    return orderedListings;
  },
};
