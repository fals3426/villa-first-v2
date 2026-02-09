import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';
import { notificationService } from '@/server/services/notifications/notification.service';

/**
 * Service de gestion de la fraude pour le support (Story 9.5)
 */
export const fraudManagementService = {
  /**
   * Suspend une annonce en cas de fraude (Story 9.5)
   */
  async suspendListing(
    listingId: string,
    supportUserId: string,
    reason: string,
    evidence?: Record<string, any>
  ) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        host: {
          select: {
            id: true,
            email: true,
          },
        },
        bookings: {
          where: {
            status: {
              in: ['confirmed', 'accepted', 'pending'],
            },
          },
          include: {
            tenant: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!listing) {
      throw new Error('LISTING_NOT_FOUND');
    }

    // Suspendre l'annonce
    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: 'suspended',
      },
    });

    // Révoquer le badge vérifié si présent
    const verificationRequest = await prisma.verificationRequest.findFirst({
      where: {
        listingId,
        status: 'approved',
      },
    });

    if (verificationRequest) {
      await prisma.verificationRequest.update({
        where: { id: verificationRequest.id },
        data: {
          status: 'revoked',
        },
      });
    }

    // Audit log avec preuves de fraude
    await auditService.logAction(supportUserId, 'LISTING_SUSPENDED_FRAUD', 'Listing', listingId, {
      listingId,
      reason,
      evidence,
      hostId: listing.hostId,
      verificationRevoked: !!verificationRequest,
    });

    // Notifier l'hôte
    await notificationService.sendNotification(listing.host.id, 'validation', {
      title: 'Annonce suspendue',
      message: `Votre annonce "${listing.title}" a été suspendue. Raison: ${reason}`,
      url: `/host/listings`,
      listingTitle: listing.title,
    }).catch((err) => {
      console.error('Erreur lors de l\'envoi de la notification:', err);
    });

    // Notifier les locataires avec réservations en cours
    for (const booking of listing.bookings) {
      await notificationService.sendNotification(booking.tenant.id, 'new_booking', {
        title: 'Réservation affectée',
        message: `L'annonce "${listing.title}" a été suspendue. Votre réservation pourrait être affectée.`,
        url: `/bookings`,
        listingTitle: listing.title,
      }).catch((err) => {
        console.error('Erreur lors de l\'envoi de la notification:', err);
      });
    }

    return updated;
  },

  /**
   * Suspend un utilisateur (bannissement) (Story 9.5)
   */
  async suspendUser(
    userId: string,
    supportUserId: string,
    reason: string,
    evidence?: Record<string, any>
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        userType: true,
      },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Créer un enregistrement de suspension (on pourrait ajouter un modèle Suspension si nécessaire)
    // Pour l'instant, on utilise les audit logs pour tracer

    // Suspendre toutes les annonces de l'utilisateur si c'est un hôte
    if (user.userType === 'host') {
      await prisma.listing.updateMany({
        where: { hostId: userId },
        data: { status: 'suspended' },
      });

      // Révoquer toutes les vérifications
      const listings = await prisma.listing.findMany({
        where: { hostId: userId },
        select: { id: true },
      });

      for (const listing of listings) {
        await prisma.verificationRequest.updateMany({
          where: {
            listingId: listing.id,
            status: 'approved',
          },
          data: {
            status: 'revoked',
          },
        });
      }
    }

    // Audit log
    await auditService.logAction(supportUserId, 'USER_SUSPENDED', 'User', userId, {
      userId,
      reason,
      evidence,
      userType: user.userType,
    });

    // Notifier l'utilisateur
    await notificationService.sendNotification(userId, 'validation', {
      title: 'Compte suspendu',
      message: `Votre compte a été suspendu. Raison: ${reason}`,
      url: `/profile`,
    }).catch((err) => {
      console.error('Erreur lors de l\'envoi de la notification:', err);
    });

    return { success: true, userId };
  },
};
