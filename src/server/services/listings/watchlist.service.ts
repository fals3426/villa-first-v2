import { prisma } from '@/lib/prisma';

/**
 * Service pour gérer les annonces suivies (Story 6.8)
 */
export const watchlistService = {
  /**
   * Ajoute une annonce à la liste de suivi (Story 6.8)
   */
  async addToWatchlist(userId: string, listingId: string) {
    // Vérifier que l'utilisateur est un locataire
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { userType: true },
    });

    if (!user || user.userType !== 'tenant') {
      throw new Error('ONLY_TENANTS_CAN_WATCH');
    }

    // Vérifier que l'annonce existe et est publiée
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { status: true },
    });

    if (!listing || listing.status !== 'published') {
      throw new Error('LISTING_NOT_FOUND_OR_NOT_PUBLISHED');
    }

    // Créer ou mettre à jour l'entrée
    return prisma.watchedListing.upsert({
      where: {
        userId_listingId: {
          userId,
          listingId,
        },
      },
      create: {
        userId,
        listingId,
      },
      update: {
        // Réinitialiser notifiedAt si on re-suit l'annonce
        notifiedAt: null,
      },
    });
  },

  /**
   * Retire une annonce de la liste de suivi (Story 6.8)
   */
  async removeFromWatchlist(userId: string, listingId: string) {
    return prisma.watchedListing.deleteMany({
      where: {
        userId,
        listingId,
      },
    });
  },

  /**
   * Récupère toutes les annonces suivies par un utilisateur (Story 6.8)
   */
  async getUserWatchlist(userId: string) {
    return prisma.watchedListing.findMany({
      where: { userId },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            location: true,
            pricePerPlace: true,
            photos: {
              where: { position: 0 },
              take: 1,
              select: { url: true },
            },
            availability: {
              where: {
                isAvailable: true,
                startDate: { gte: new Date() },
              },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Vérifie si une place s'est libérée dans une annonce suivie (Story 6.8)
   */
  async checkPlaceAvailable(watchedListingId: string): Promise<boolean> {
    const watched = await prisma.watchedListing.findUnique({
      where: { id: watchedListingId },
      include: {
        listing: {
          include: {
            availability: {
              where: {
                isAvailable: true,
                startDate: { gte: new Date() },
              },
            },
            bookings: {
              where: {
                status: { in: ['pending', 'confirmed'] },
              },
            },
          },
        },
      },
    });

    if (!watched) {
      return false;
    }

    const listing = watched.listing;
    const availableSlots = listing.availability.length;
    const activeBookings = listing.bookings.length;

    // Une place est disponible si le nombre de slots disponibles > nombre de réservations actives
    return availableSlots > activeBookings;
  },

  /**
   * Trouve toutes les annonces suivies avec des places disponibles (Story 6.8)
   */
  async findListingsWithAvailablePlaces(userId?: string): Promise<
    Array<{
      watchedListingId: string;
      listingId: string;
      userId: string;
      listingTitle: string;
    }>
  > {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const watchedListings = await prisma.watchedListing.findMany({
      where,
      include: {
        listing: {
          include: {
            availability: {
              where: {
                isAvailable: true,
                startDate: { gte: new Date() },
              },
            },
            bookings: {
              where: {
                status: { in: ['pending', 'confirmed'] },
              },
            },
          },
        },
      },
    });

    const results: Array<{
      watchedListingId: string;
      listingId: string;
      userId: string;
      listingTitle: string;
    }> = [];

    for (const watched of watchedListings) {
      const availableSlots = watched.listing.availability.length;
      const activeBookings = watched.listing.bookings.length;

      // Vérifier qu'une place est disponible ET qu'on n'a pas déjà notifié récemment
      if (availableSlots > activeBookings) {
        // Si on a déjà notifié il y a moins de 24h, ne pas renvoyer
        if (watched.notifiedAt) {
          const hoursSinceNotification =
            (new Date().getTime() - watched.notifiedAt.getTime()) / (1000 * 60 * 60);
          if (hoursSinceNotification < 24) {
            continue;
          }
        }

        results.push({
          watchedListingId: watched.id,
          listingId: watched.listingId,
          userId: watched.userId,
          listingTitle: watched.listing.title,
        });
      }
    }

    return results;
  },

  /**
   * Marque une annonce comme notifiée (Story 6.8)
   */
  async markAsNotified(watchedListingId: string) {
    return prisma.watchedListing.update({
      where: { id: watchedListingId },
      data: { notifiedAt: new Date() },
    });
  },
};
