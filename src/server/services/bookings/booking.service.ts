import { prisma } from '@/lib/prisma';
import { kycService } from '@/server/services/kyc/kyc.service';
import { calendarService } from '@/server/services/listings/calendar.service';
import { auditService } from '@/server/services/audit/audit.service';

export interface CreateBookingInput {
  listingId: string;
  checkIn: Date;
  checkOut: Date;
}

/**
 * Service pour gérer les réservations (Story 5.1)
 */
export const bookingService = {
  /**
   * Crée une nouvelle réservation (Story 5.1)
   */
  async createBooking(tenantId: string, input: CreateBookingInput) {
    // Vérifier que l'utilisateur est bien un locataire
    const user = await prisma.user.findUnique({
      where: { id: tenantId },
      select: { userType: true },
    });

    if (!user || user.userType !== 'tenant') {
      throw new Error('USER_NOT_TENANT');
    }

    // Vérifier que l'utilisateur est KYC vérifié
    const isKycVerified = await kycService.checkKycVerified(tenantId);
    if (!isKycVerified) {
      throw new Error('TENANT_KYC_NOT_VERIFIED');
    }

    // Vérifier que l'annonce existe et est publiée
    const listing = await prisma.listing.findUnique({
      where: { id: input.listingId },
      select: {
        id: true,
        status: true,
        hostId: true,
        pricePerPlace: true, // Nécessaire pour stocker le prix au moment de la réservation (Story 5.2)
      },
    });

    if (!listing) {
      throw new Error('LISTING_NOT_FOUND');
    }

    if (listing.status !== 'published') {
      throw new Error('LISTING_NOT_PUBLISHED');
    }

    // Vérifier que le locataire ne réserve pas sa propre annonce
    if (listing.hostId === tenantId) {
      throw new Error('CANNOT_BOOK_OWN_LISTING');
    }

    // Vérifier que les dates sont valides
    if (input.checkIn >= input.checkOut) {
      throw new Error('INVALID_DATE_RANGE');
    }

    // Vérifier que check-in n'est pas dans le passé
    const now = new Date();
    if (input.checkIn < now) {
      throw new Error('CHECK_IN_IN_PAST');
    }

    // Vérifier la disponibilité (avec transaction pour éviter les race conditions)
    const isAvailable = await prisma.$transaction(async (tx) => {
      // Vérifier la disponibilité
      const available = await calendarService.checkAvailability(
        input.listingId,
        input.checkIn,
        input.checkOut
      );

      if (!available) {
        return false;
      }

      // Créer la réservation avec le prix au moment de la réservation (Story 5.2)
      await tx.booking.create({
        data: {
          listingId: input.listingId,
          tenantId,
          checkIn: input.checkIn,
          checkOut: input.checkOut,
          status: 'pending',
          priceAtBooking: listing.pricePerPlace, // Stocker le prix au moment de la réservation
          currentListingPrice: listing.pricePerPlace, // Initialiser avec le prix actuel
        },
      });

      return true;
    });

    if (!isAvailable) {
      throw new Error('DATES_NOT_AVAILABLE');
    }

    // Bloquer les dates dans le calendrier
    await calendarService.blockDatesForBooking(
      input.listingId,
      input.checkIn,
      input.checkOut
    );

    // Récupérer la réservation créée
    const booking = await prisma.booking.findFirst({
      where: {
        listingId: input.listingId,
        tenantId,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        status: 'pending',
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            hostId: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!booking) {
      throw new Error('BOOKING_CREATION_FAILED');
    }

    // Audit
    await auditService.logAction(
      tenantId,
      'booking_created',
      'booking',
      booking.id,
      {
        listingId: input.listingId,
        checkIn: input.checkIn.toISOString(),
        checkOut: input.checkOut.toISOString(),
      }
    );

    return booking;
  },

  /**
   * Gère le changement de prix d'une annonce (Story 5.2)
   * Bloque toutes les réservations en attente si le prix a changé
   */
  async handlePriceChange(listingId: string, newPrice: number) {
    // Trouver toutes les réservations en attente pour cette annonce
    const pendingBookings = await prisma.booking.findMany({
      where: {
        listingId,
        status: 'pending', // Seulement les réservations en attente
      },
      include: {
        tenant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Mettre à jour les réservations dont le prix a changé
    const updatedBookings = [];
    for (const booking of pendingBookings) {
      // Comparer le prix au moment de la réservation avec le nouveau prix
      if (booking.priceAtBooking !== null && booking.priceAtBooking !== newPrice) {
        // Mettre à jour le statut à "price_changed"
        const updated = await prisma.booking.update({
          where: { id: booking.id },
          data: {
            status: 'price_changed',
            currentListingPrice: newPrice,
            updatedAt: new Date(),
          },
        });

        updatedBookings.push({
          booking: updated,
          tenant: booking.tenant,
          oldPrice: booking.priceAtBooking,
          newPrice,
        });

        // Audit
        await auditService.logAction(
          booking.tenantId,
          'booking_price_changed',
          'booking',
          booking.id,
          {
            listingId,
            oldPrice: booking.priceAtBooking,
            newPrice,
          }
        );

        // TODO (Story 5.3): Annuler les préautorisations Stripe si elles existent
        // await paymentService.cancelPreauthorization(booking.id);
      } else {
        // Mettre à jour seulement currentListingPrice si le prix n'a pas changé
        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            currentListingPrice: newPrice,
          },
        });
      }
    }

    // TODO (Epic 6): Notifier les locataires concernés
    // for (const { tenant, oldPrice, newPrice } of updatedBookings) {
    //   await notificationService.notifyPriceChange(tenant.id, { oldPrice, newPrice });
    // }

    return updatedBookings;
  },
};
