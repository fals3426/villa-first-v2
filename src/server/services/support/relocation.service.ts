import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';
import { notificationService } from '@/server/services/notifications/notification.service';
import { refundService } from './refund.service';

/**
 * Service de relogement pour le support (Story 9.7)
 */
export const relocationService = {
  /**
   * Propose un relogement à un locataire (Story 9.7)
   */
  async proposeRelocation(
    bookingId: string,
    newListingId: string,
    supportUserId: string,
    autoRefund: boolean = false
  ) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        tenant: {
          select: {
            id: true,
            email: true,
          },
        },
        listing: {
          select: {
            id: true,
            title: true,
            hostId: true,
            host: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!booking) {
      throw new Error('BOOKING_NOT_FOUND');
    }

    const newListing = await prisma.listing.findUnique({
      where: { id: newListingId },
      select: {
        id: true,
        title: true,
        address: true,
        hostId: true,
        status: true,
        capacity: true,
        pricePerPlace: true,
      },
    });

    if (!newListing) {
      throw new Error('NEW_LISTING_NOT_FOUND');
    }

    if (newListing.status !== 'published') {
      throw new Error('NEW_LISTING_NOT_AVAILABLE');
    }

    // Créer une nouvelle réservation pour le relogement
    const newBooking = await prisma.booking.create({
      data: {
        listingId: newListingId,
        tenantId: booking.tenantId,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        status: 'pending', // Le locataire doit accepter
        priceAtBooking: newListing.pricePerPlace
          ? Math.round(newListing.pricePerPlace * 100)
          : null,
      },
    });

    // Rembourser l'ancienne réservation si demandé
    if (autoRefund) {
      try {
        await refundService.refundBooking(
          bookingId,
          supportUserId,
          null, // Remboursement total
          'Relogement automatique'
        );
      } catch (err) {
        console.error('Erreur lors du remboursement automatique:', err);
        // Continue même si le remboursement échoue
      }
    }

    // Audit log
    await auditService.logAction(supportUserId, 'RELOCATION_PROPOSED', 'Booking', bookingId, {
      oldBookingId: bookingId,
      newBookingId: newBooking.id,
      oldListingId: booking.listingId,
      newListingId: newListingId,
      autoRefund,
    });

    // Notifier le locataire
    await notificationService.sendNotification(booking.tenant.id, 'new_booking', {
      title: 'Proposition de relogement',
      message: `Une nouvelle option de relogement vous a été proposée : "${newListing.title}"`,
      url: `/bookings/new/${newListingId}`,
      listingTitle: newListing.title,
    }).catch((err) => {
      console.error('Erreur lors de l\'envoi de la notification:', err);
    });

    // Notifier l'hôte de l'ancienne annonce
    await notificationService.sendNotification(booking.listing.host.id, 'new_booking', {
      title: 'Relogement proposé',
      message: `Un relogement a été proposé pour votre réservation "${booking.listing.title}"`,
      url: `/host/bookings`,
      listingTitle: booking.listing.title,
    }).catch((err) => {
      console.error('Erreur lors de l\'envoi de la notification:', err);
    });

    return {
      success: true,
      oldBookingId: bookingId,
      newBookingId: newBooking.id,
      newListing: {
        id: newListing.id,
        title: newListing.title,
        address: newListing.address,
      },
    };
  },
};
