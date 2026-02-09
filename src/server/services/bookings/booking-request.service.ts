import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';
import { paymentService } from '@/server/services/payments/payment.service';
import { calendarService } from '@/server/services/listings/calendar.service';
import { notificationService } from '@/server/services/notifications/notification.service';

/**
 * Service pour gérer les demandes de réservation (Epic 7)
 */
export const bookingRequestService = {
  /**
   * Récupère les demandes de réservation pour un hôte avec filtres (Story 7.1)
   */
  async getHostBookingRequests(
    hostId: string,
    filters?: {
      listingId?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const where: any = {
      listing: {
        hostId,
      },
    };

    if (filters?.listingId) {
      where.listingId = filters.listingId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      where.OR = [];
      if (filters.startDate) {
        where.OR.push({ checkIn: { gte: filters.startDate } });
      }
      if (filters.endDate) {
        where.OR.push({ checkOut: { lte: filters.endDate } });
      }
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            location: true,
            capacity: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
            kycVerification: {
              select: {
                status: true,
              },
            },
          },
        },
        payments: {
          where: {
            status: { in: ['pending', 'captured'] },
          },
          select: {
            id: true,
            amount: true,
            status: true,
            expiresAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookings;
  },

  /**
   * Accepte une demande de réservation (Story 7.2)
   */
  async acceptBookingRequest(hostId: string, bookingId: string) {
    // Vérifier que la réservation existe et appartient à l'hôte
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          select: {
            id: true,
            hostId: true,
            title: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!booking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    if (booking.listing.hostId !== hostId) {
      throw new Error('NOT_AUTHORIZED');
    }

    if (booking.status !== 'pending') {
      throw new Error('BOOKING_NOT_PENDING');
    }

    // Vérifier que les dates sont toujours disponibles (exclure cette réservation du conflit)
    const isAvailable = await calendarService.checkAvailability(
      booking.listingId,
      booking.checkIn,
      booking.checkOut,
      bookingId
    );

    if (!isAvailable) {
      throw new Error('DATES_NOT_AVAILABLE');
    }

    // Mettre à jour le statut à "accepted"
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'accepted' as const,
        updatedAt: new Date(),
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
        tenant: {
          select: {
            id: true,
          },
        },
      },
    });

    // Confirmer les dates dans le calendrier (blocage définitif)
    await calendarService.blockDateRange(
      booking.listingId,
      booking.checkIn,
      booking.checkOut
    );

    // Audit log
    await auditService.logAction(hostId, 'BOOKING_ACCEPTED', 'Booking', bookingId, {
      listingId: booking.listingId,
      tenantId: booking.tenantId,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
    });

    // Notifier le locataire (Story 7.2)
    await notificationService.sendNotification(booking.tenant.id, 'new_booking', {
      title: 'Demande de réservation acceptée',
      message: `Votre demande de réservation pour "${booking.listing.title}" a été acceptée !`,
      url: `/bookings`,
      listingTitle: booking.listing.title,
    }).catch((err) => {
      console.error('Erreur lors de l\'envoi de la notification:', err);
    });

    return updatedBooking;
  },

  /**
   * Refuse une demande de réservation (Story 7.2)
   */
  async rejectBookingRequest(hostId: string, bookingId: string, reason?: string) {
    // Vérifier que la réservation existe et appartient à l'hôte
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        listing: {
          select: {
            id: true,
            hostId: true,
            title: true,
          },
        },
        tenant: {
          select: {
            id: true,
          },
        },
        payments: {
          where: {
            status: 'pending',
          },
        },
      },
    });

    if (!booking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    if (booking.listing.hostId !== hostId) {
      throw new Error('NOT_AUTHORIZED');
    }

    if (booking.status !== 'pending') {
      throw new Error('BOOKING_NOT_PENDING');
    }

    // Annuler les préautorisations en attente
    for (const payment of booking.payments) {
      if (payment.status === 'pending') {
        try {
          await paymentService.cancelPreauthorization(payment.id, hostId);
        } catch (err) {
          console.error(`Erreur lors de l'annulation de la préautorisation ${payment.id}:`, err);
          // Continuer même si l'annulation échoue
        }
      }
    }

    // Mettre à jour le statut à "rejected"
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'rejected' as const,
        rejectionReason: reason || null,
        updatedAt: new Date(),
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
          },
        },
        tenant: {
          select: {
            id: true,
          },
        },
      },
    });

    // Libérer les dates dans le calendrier
    await calendarService.releaseDateRange(
      booking.listingId,
      booking.checkIn,
      booking.checkOut
    );

    // Audit log
    await auditService.logAction(hostId, 'BOOKING_REJECTED', 'Booking', bookingId, {
      listingId: booking.listingId,
      tenantId: booking.tenantId,
      reason: reason || null,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
    });

    // Notifier le locataire (Story 7.2)
    await notificationService.sendNotification(booking.tenant.id, 'new_booking', {
      title: 'Demande de réservation refusée',
      message: `Votre demande de réservation pour "${booking.listing.title}" a été refusée.${reason ? ` Raison: ${reason}` : ''}`,
      url: `/bookings`,
      listingTitle: booking.listing.title,
    }).catch((err) => {
      console.error('Erreur lors de l\'envoi de la notification:', err);
    });

    return updatedBooking;
  },
};
