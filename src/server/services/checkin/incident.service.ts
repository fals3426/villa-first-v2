import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';
import { notificationService } from '@/server/services/notifications/notification.service';

/**
 * Service pour gérer les incidents de check-in (Story 8.5)
 */
export const incidentService = {
  /**
   * Signale un incident lors du check-in (Story 8.5)
   */
  async reportIncident(
    bookingId: string,
    tenantId: string,
    data: {
      type: 'CODE_NOT_WORKING' | 'PLACE_DIFFERENT' | 'ACCESS_ISSUE' | 'OTHER';
      description: string;
      photos?: string[]; // URLs des photos
    }
  ) {
    // Vérifier que la réservation existe et appartient au locataire
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
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
          },
        },
      },
    });

    if (!booking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    if (booking.tenantId !== tenantId) {
      throw new Error('NOT_AUTHORIZED');
    }

    // Créer l'incident (marqué comme urgent par défaut) (Story 9.3)
    const incident = await prisma.incident.create({
      data: {
        bookingId,
        type: data.type,
        description: data.description,
        photos: data.photos ? (data.photos as any) : null,
        status: 'reported',
        isUrgent: true, // Mode urgent par défaut (Story 9.3)
      },
    });

    // Mettre à jour le statut de la réservation
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'incident_reported',
        updatedAt: new Date(),
      },
    });

    // Audit log
    await auditService.logAction(tenantId, 'INCIDENT_REPORTED', 'Incident', incident.id, {
      bookingId,
      type: data.type,
    });

    // Notifier l'hôte (Story 8.5)
    await notificationService.sendNotification(booking.listing.hostId, 'check_in_issue', {
      title: 'Incident signalé lors du check-in',
      message: `Un incident a été signalé pour la réservation "${booking.listing.title}"`,
      url: `/host/bookings`,
      listingTitle: booking.listing.title,
    }).catch((err) => {
      console.error('Erreur lors de l\'envoi de la notification:', err);
    });

    // TODO: Notifier le support (Epic 9) - mode urgent

    return incident;
  },

  /**
   * Récupère les incidents d'une réservation (Story 8.5)
   */
  async getIncidentsForBooking(bookingId: string, userId: string) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          select: {
            hostId: true,
          },
        },
        tenant: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    const isTenant = booking.tenantId === userId;
    const isHost = booking.listing.hostId === userId;

    if (!isTenant && !isHost) {
      throw new Error('NOT_AUTHORIZED');
    }

    return prisma.incident.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  },
};
