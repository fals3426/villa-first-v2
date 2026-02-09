import { prisma } from '@/lib/prisma';
import { completenessService } from '@/server/services/listings/completeness.service';
import { auditService } from '@/server/services/audit/audit.service';

/**
 * Service pour gérer le calendrier de disponibilité d'une annonce (Story 3.7)
 */
export const calendarService = {
  /**
   * Récupère les créneaux de disponibilité pour un mois donné
   */
  async getCalendarForListing(
    listingId: string,
    month: number,
    year: number
  ) {
    // Calculer les dates de début et fin du mois
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const slots = await prisma.availabilitySlot.findMany({
      where: {
        listingId,
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
      orderBy: { startDate: 'asc' },
    });

    return slots;
  },

  /**
   * Récupère disponibilité + réservations pour affichage locataire (dates libres/occupées)
   */
  async getAvailabilityForBooking(
    listingId: string,
    month: number,
    year: number
  ) {
    const slots = await this.getCalendarForListing(listingId, month, year);

    // Récupérer aussi les réservations pending/confirmed (au cas où pas encore converties en slots)
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const bookings = await prisma.booking.findMany({
      where: {
        listingId,
        status: { in: ['pending', 'confirmed'] },
        checkIn: { lt: endDate },
        checkOut: { gt: startDate },
      },
      select: { checkIn: true, checkOut: true },
    });

    return { slots, bookings };
  },

  /**
   * Crée ou met à jour un créneau de disponibilité
   */
  async setAvailabilitySlot(
    listingId: string,
    hostId: string,
    startDate: Date,
    endDate: Date,
    isAvailable: boolean
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

    // Vérifier que les dates sont valides
    if (startDate >= endDate) {
      throw new Error('INVALID_DATE_RANGE');
    }

    // Vérifier s'il existe déjà un créneau qui chevauche
    const overlappingSlot = await prisma.availabilitySlot.findFirst({
      where: {
        listingId,
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    });

    if (overlappingSlot) {
      // Mettre à jour le créneau existant
      const updated = await prisma.availabilitySlot.update({
        where: { id: overlappingSlot.id },
        data: {
          startDate,
          endDate,
          isAvailable,
          updatedAt: new Date(),
        },
      });

      // Recalculer le score de complétude
      await completenessService.recalculateAndPersistCompleteness(listingId);

      // Audit
      await auditService.logAction(
        hostId,
        'listing_availability_updated',
        'listing',
        listingId,
        {
          slotId: updated.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          isAvailable,
        }
      );

      return updated;
    }

    // Créer un nouveau créneau
    const created = await prisma.availabilitySlot.create({
      data: {
        listingId,
        startDate,
        endDate,
        isAvailable,
      },
    });

    // Recalculer le score de complétude
    await completenessService.recalculateAndPersistCompleteness(listingId);

    // Audit
    await auditService.logAction(
      hostId,
      'listing_availability_created',
      'listing',
      listingId,
      {
        slotId: created.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        isAvailable,
      }
    );

    return created;
  },

  /**
   * Supprime un créneau de disponibilité
   */
  async deleteAvailabilitySlot(slotId: string, hostId: string) {
    // Récupérer le créneau avec l'annonce pour vérifier l'ownership
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
      include: {
        listing: {
          select: { hostId: true, id: true },
        },
      },
    });

    if (!slot) {
      throw new Error('SLOT_NOT_FOUND');
    }

    if (slot.listing.hostId !== hostId) {
      throw new Error('LISTING_NOT_OWNED');
    }

    await prisma.availabilitySlot.delete({
      where: { id: slotId },
    });

    // Recalculer le score de complétude
    await completenessService.recalculateAndPersistCompleteness(slot.listing.id);

    // Audit
    await auditService.logAction(
      hostId,
      'listing_availability_deleted',
      'listing',
      slot.listing.id,
      {
        slotId,
      }
    );
  },

  /**
   * Vérifie si une période est disponible pour une réservation (Story 5.1)
   * @param excludeBookingId - ID de réservation à exclure du conflit (ex: lors de l'acceptation d'une demande en attente)
   */
  async checkAvailability(
    listingId: string,
    checkIn: Date,
    checkOut: Date,
    excludeBookingId?: string
  ): Promise<boolean> {
    // Vérifier qu'il n'y a pas de créneaux indisponibles qui chevauchent
    const unavailableSlots = await prisma.availabilitySlot.findFirst({
      where: {
        listingId,
        startDate: { lt: checkOut },
        endDate: { gt: checkIn },
        isAvailable: false,
      },
    });

    if (unavailableSlots) {
      return false;
    }

    // Vérifier qu'il n'y a pas de réservations confirmées ou en attente qui chevauchent
    const conflictingBookings = await prisma.booking.findFirst({
      where: {
        listingId,
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
        status: {
          in: ['pending', 'confirmed'],
        },
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      },
    });

    return !conflictingBookings;
  },

  /**
   * Bloque une plage de dates pour une réservation acceptée (Story 7.2)
   */
  async blockDateRange(listingId: string, checkIn: Date, checkOut: Date) {
    // Récupérer l'hostId pour l'audit
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { hostId: true },
    });

    if (!listing) {
      throw new Error('LISTING_NOT_FOUND');
    }

    // Créer ou mettre à jour un créneau pour bloquer ces dates
    return this.setAvailabilitySlot(listingId, listing.hostId, checkIn, checkOut, false);
  },

  /**
   * Libère une plage de dates après refus d'une réservation (Story 7.2)
   */
  async releaseDateRange(listingId: string, checkIn: Date, checkOut: Date) {
    // Trouver les créneaux qui chevauchent cette plage
    const overlappingSlots = await prisma.availabilitySlot.findMany({
      where: {
        listingId,
        startDate: { lt: checkOut },
        endDate: { gt: checkIn },
        isAvailable: false,
      },
    });

    // Libérer les créneaux
    for (const slot of overlappingSlots) {
      await prisma.availabilitySlot.update({
        where: { id: slot.id },
        data: {
          isAvailable: true,
          updatedAt: new Date(),
        },
      });
    }

    return overlappingSlots;
  },

  /**
   * Bloque les dates pour une réservation (Story 5.1)
   * Cette méthode ne vérifie pas l'ownership car elle est appelée lors de la création d'une réservation
   */
  async blockDatesForBooking(listingId: string, checkIn: Date, checkOut: Date) {
    // Vérifier s'il existe déjà un créneau qui chevauche
    const overlappingSlot = await prisma.availabilitySlot.findFirst({
      where: {
        listingId,
        startDate: { lt: checkOut },
        endDate: { gt: checkIn },
      },
    });

    if (overlappingSlot) {
      // Mettre à jour le créneau existant pour le rendre indisponible
      await prisma.availabilitySlot.update({
        where: { id: overlappingSlot.id },
        data: {
          startDate: new Date(Math.min(overlappingSlot.startDate.getTime(), checkIn.getTime())),
          endDate: new Date(Math.max(overlappingSlot.endDate.getTime(), checkOut.getTime())),
          isAvailable: false,
          updatedAt: new Date(),
        },
      });
    } else {
      // Créer un nouveau créneau indisponible
      await prisma.availabilitySlot.create({
        data: {
          listingId,
          startDate: checkIn,
          endDate: checkOut,
          isAvailable: false,
        },
      });
    }
  },

  /**
   * Libère les dates d'une réservation annulée (Story 5.2)
   * Supprime ou met à jour les créneaux de disponibilité
   */
  async unblockDatesForBooking(listingId: string, checkIn: Date, checkOut: Date) {
    // Trouver les créneaux qui chevauchent exactement cette période
    const slots = await prisma.availabilitySlot.findMany({
      where: {
        listingId,
        startDate: { lte: checkOut },
        endDate: { gte: checkIn },
        isAvailable: false, // Seulement les créneaux bloqués
      },
    });

    // Pour chaque créneau, soit le supprimer, soit le rendre disponible
    for (const slot of slots) {
      // Si le créneau correspond exactement à la période, le supprimer
      if (
        slot.startDate.getTime() === checkIn.getTime() &&
        slot.endDate.getTime() === checkOut.getTime()
      ) {
        await prisma.availabilitySlot.delete({
          where: { id: slot.id },
        });
      } else {
        // Sinon, rendre le créneau disponible
        await prisma.availabilitySlot.update({
          where: { id: slot.id },
          data: {
            isAvailable: true,
            updatedAt: new Date(),
          },
        });
      }
    }
  },
};
