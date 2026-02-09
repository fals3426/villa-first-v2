import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';
import { notificationService } from '@/server/services/notifications/notification.service';

/**
 * Service de gestion des alertes de synchronisation de calendrier (Story 9.8)
 */
export const calendarAlertService = {
  /**
   * Crée une alerte pour un échec de synchronisation (Story 9.8)
   */
  async createSyncFailureAlert(
    listingId: string,
    errorType: string,
    errorMessage: string,
    attemptCount: number
  ) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        title: true,
        hostId: true,
      },
    });

    if (!listing) {
      throw new Error('LISTING_NOT_FOUND');
    }

    // Créer l'alerte (on pourrait créer un modèle Alert si nécessaire)
    // Pour l'instant, on utilise les audit logs
    await auditService.logAction(null, 'CALENDAR_SYNC_FAILURE', 'Listing', listingId, {
      listingId,
      errorType,
      errorMessage,
      attemptCount,
      timestamp: new Date().toISOString(),
    });

    // Notifier le support si plusieurs tentatives échouées
    if (attemptCount >= 3) {
      const supportUsers = await prisma.user.findMany({
        where: {
          userType: 'support',
        },
        select: {
          id: true,
          email: true,
        },
      });

      for (const supportUser of supportUsers) {
        await notificationService.sendNotification(supportUser.id, 'check_in_issue', {
          title: '⚠️ Échec synchronisation calendrier',
          message: `La synchronisation du calendrier a échoué ${attemptCount} fois pour l'annonce "${listing.title}"`,
          url: `/admin/listings/${listingId}`,
          listingTitle: listing.title,
        }).catch((err) => {
          console.error('Erreur lors de l\'envoi de la notification:', err);
        });
      }
    }

    return {
      success: true,
      listingId,
      attemptCount,
      notified: attemptCount >= 3,
    };
  },

  /**
   * Récupère les alertes de synchronisation (Story 9.8)
   */
  async getSyncFailureAlerts(listingId?: string) {
    const where: any = {
      entityType: 'Listing',
      action: 'CALENDAR_SYNC_FAILURE',
    };

    if (listingId) {
      where.entityId = listingId;
    }

    const alerts = await prisma.auditLog.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    });

    return alerts.map((alert) => ({
      id: alert.id,
      listingId: alert.entityId,
      errorType: (alert.details as any)?.errorType,
      errorMessage: (alert.details as any)?.errorMessage,
      attemptCount: (alert.details as any)?.attemptCount,
      createdAt: alert.createdAt,
    }));
  },

  /**
   * Marque une alerte comme résolue (Story 9.8)
   */
  async markAlertAsResolved(alertId: string, supportUserId: string) {
    const alert = await prisma.auditLog.findUnique({
      where: { id: alertId },
    });

    if (!alert) {
      throw new Error('ALERT_NOT_FOUND');
    }

    // Créer un log de résolution
    await auditService.logAction(supportUserId, 'CALENDAR_SYNC_ALERT_RESOLVED', 'AuditLog', alertId, {
      alertId,
      originalAlert: alert.id,
    });

    return { success: true, alertId };
  },
};
