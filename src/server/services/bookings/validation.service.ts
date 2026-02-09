import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';
import { notificationService } from '@/server/services/notifications/notification.service';

/**
 * Service pour gérer les règles de validation des réservations (Story 5.5)
 */
export const validationService = {
  /**
   * Met à jour les règles de validation pour une annonce (Story 5.5)
   */
  async updateValidationRules(
    listingId: string,
    hostId: string,
    rules: {
      validationRule: 'FULL_ONLY' | 'PARTIAL' | 'MANUAL';
      validationThreshold?: number;
    }
  ) {
    // Vérifier l'ownership
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hostId: true, capacity: true },
    });

    if (!listing) {
      throw new Error('LISTING_NOT_FOUND');
    }

    if (listing.hostId !== hostId) {
      throw new Error('LISTING_NOT_OWNED');
    }

    // Valider les règles
    if (rules.validationRule === 'PARTIAL') {
      if (!rules.validationThreshold || rules.validationThreshold < 1 || rules.validationThreshold > 100) {
        throw new Error('INVALID_THRESHOLD');
      }
    } else {
      // Pour FULL_ONLY et MANUAL, pas de threshold nécessaire
      rules.validationThreshold = undefined;
    }

    // Mettre à jour les règles
    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        validationRule: rules.validationRule,
        validationThreshold: rules.validationThreshold || null,
        updatedAt: new Date(),
      },
    });

    // Audit
    await auditService.logAction(
      hostId,
      'validation_rules_updated',
      'listing',
      listingId,
      {
        validationRule: rules.validationRule,
        validationThreshold: rules.validationThreshold,
      }
    );

    return updated;
  },

  /**
   * Vérifie si les conditions de validation automatique sont remplies (Story 5.7)
   */
  async checkAutoValidation(listingId: string): Promise<boolean> {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        validationRule: true,
        validationThreshold: true,
        capacity: true,
        bookings: {
          where: {
            status: 'pending',
          },
          select: {
            id: true,
          },
        },
      },
    });

    if (!listing) {
      return false;
    }

    // Si pas de règle définie ou MANUAL, pas de validation automatique
    if (!listing.validationRule || listing.validationRule === 'MANUAL') {
      return false;
    }

    const pendingBookingsCount = listing.bookings.length;

    if (listing.validationRule === 'FULL_ONLY') {
      // Validation automatique si toutes les places sont réservées
      return pendingBookingsCount >= listing.capacity;
    }

    if (listing.validationRule === 'PARTIAL' && listing.validationThreshold) {
      // Validation automatique si X% des places sont réservées
      const requiredBookings = Math.ceil((listing.capacity * listing.validationThreshold) / 100);
      return pendingBookingsCount >= requiredBookings;
    }

    return false;
  },

  /**
   * Récupère les règles de validation d'une annonce
   */
  async getValidationRules(listingId: string) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        validationRule: true,
        validationThreshold: true,
        capacity: true,
      },
    });

    return listing
      ? {
          validationRule: listing.validationRule,
          validationThreshold: listing.validationThreshold,
          capacity: listing.capacity,
        }
      : null;
  },

  /**
   * Valide manuellement une colocation (Story 5.6)
   * Déclenche la capture de toutes les préautorisations (Story 5.7)
   */
  async validateColocationManually(listingId: string, hostId: string) {
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

    // Trouver toutes les réservations pending pour cette annonce
    const pendingBookings = await prisma.booking.findMany({
      where: {
        listingId,
        status: 'pending',
      },
      include: {
        payments: {
          where: {
            status: 'pending',
          },
        },
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

    if (pendingBookings.length === 0) {
      throw new Error('NO_PENDING_BOOKINGS');
    }

    // Capturer toutes les préautorisations (Story 5.7)
    const { paymentService } = await import('@/server/services/payments/payment.service');
    const captureResults = await paymentService.captureAllPreauthorizations(listingId);

    // Mettre à jour le statut de toutes les réservations à "confirmed"
    const updatedBookings = await prisma.$transaction(
      pendingBookings.map((booking) =>
        prisma.booking.update({
          where: { id: booking.id },
          data: { status: 'confirmed', updatedAt: new Date() },
        })
      )
    );

    // Récupérer les détails de l'annonce pour les notifications
    const listingDetails = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { title: true },
    });

    // Notifier les locataires avec réservations confirmées (Story 6.3, 6.4, 6.5)
    for (const booking of pendingBookings) {
      await notificationService.sendNotification(booking.tenant.id, 'validation', {
        title: 'Colocation validée',
        message: `Votre réservation pour "${listingDetails?.title || 'la colocation'}" a été validée !`,
        url: `/bookings`,
        listingTitle: listingDetails?.title,
      }).catch((err) => {
        console.error('Erreur lors de l\'envoi de la notification:', err);
      });
    }

    // Audit log
    await auditService.logAction(
      hostId,
      'colocation_validated_manually',
      'listing',
      listingId,
      {
        listingId,
        bookingsCount: pendingBookings.length,
        captureResults: captureResults.map((r) => ({
          paymentId: r.paymentId,
          success: r.success,
          error: r.error,
        })),
      }
    );

    return {
      listingId,
      validatedBookings: updatedBookings,
      captureResults,
      bookingsCount: pendingBookings.length,
    };
  },
};
