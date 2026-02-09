import { prisma } from '@/lib/prisma';
import { auditService } from '@/server/services/audit/audit.service';
import { notificationService } from '@/server/services/notifications/notification.service';

/**
 * Service de gestion des incidents pour le support (Story 9.3)
 */
export const incidentManagementService = {
  /**
   * Accuse réception d'un incident (première réponse <30 min) (Story 9.3)
   */
  async acknowledgeIncident(incidentId: string, supportUserId: string) {
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
      include: {
        booking: {
          include: {
            tenant: {
              select: { id: true, email: true },
            },
            listing: {
              select: { title: true },
            },
          },
        },
      },
    });

    if (!incident) {
      throw new Error('INCIDENT_NOT_FOUND');
    }

    if (incident.acknowledgedAt) {
      throw new Error('INCIDENT_ALREADY_ACKNOWLEDGED');
    }

    // Calculer le temps écoulé depuis le signalement
    const timeSinceReport = Date.now() - incident.createdAt.getTime();
    const minutesSinceReport = Math.floor(timeSinceReport / (1000 * 60));

    const updated = await prisma.incident.update({
      where: { id: incidentId },
      data: {
        acknowledgedAt: new Date(),
        acknowledgedBy: supportUserId,
        status: 'in_progress',
        updatedAt: new Date(),
      },
    });

    // Audit log
    await auditService.logAction(supportUserId, 'INCIDENT_ACKNOWLEDGED', 'Incident', incidentId, {
      incidentId,
      minutesSinceReport,
      withinSLA: minutesSinceReport < 30,
    });

    // Notifier le locataire que l'incident est pris en charge
    await notificationService.sendNotification(incident.booking.tenant.id, 'check_in_issue', {
      title: 'Incident pris en charge',
      message: `Votre incident pour "${incident.booking.listing.title}" a été pris en charge par le support.`,
      url: `/bookings`,
      listingTitle: incident.booking.listing.title,
    }).catch((err) => {
      console.error('Erreur lors de l\'envoi de la notification:', err);
    });

    return {
      ...updated,
      minutesSinceReport,
      withinSLA: minutesSinceReport < 30,
    };
  },

  /**
   * Résout un incident (Story 9.3)
   */
  async resolveIncident(incidentId: string, supportUserId: string, resolutionNotes?: string) {
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
      include: {
        booking: {
          include: {
            tenant: {
              select: { id: true, email: true },
            },
            listing: {
              select: { title: true },
            },
          },
        },
      },
    });

    if (!incident) {
      throw new Error('INCIDENT_NOT_FOUND');
    }

    const updated = await prisma.incident.update({
      where: { id: incidentId },
      data: {
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy: supportUserId,
        updatedAt: new Date(),
      },
    });

    // Mettre à jour le statut de la réservation si nécessaire
    if (incident.booking.status === 'incident_reported') {
      await prisma.booking.update({
        where: { id: incident.bookingId },
        data: {
          status: 'confirmed',
          updatedAt: new Date(),
        },
      });
    }

    // Audit log
    await auditService.logAction(supportUserId, 'INCIDENT_RESOLVED', 'Incident', incidentId, {
      incidentId,
      resolutionNotes,
    });

    // Notifier le locataire
    await notificationService.sendNotification(incident.booking.tenant.id, 'check_in_issue', {
      title: 'Incident résolu',
      message: `Votre incident pour "${incident.booking.listing.title}" a été résolu.`,
      url: `/bookings`,
      listingTitle: incident.booking.listing.title,
    }).catch((err) => {
      console.error('Erreur lors de l\'envoi de la notification:', err);
    });

    return updated;
  },

  /**
   * Ferme un incident (Story 9.3)
   */
  async closeIncident(incidentId: string, supportUserId: string) {
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
    });

    if (!incident) {
      throw new Error('INCIDENT_NOT_FOUND');
    }

    if (incident.status !== 'resolved') {
      throw new Error('INCIDENT_NOT_RESOLVED');
    }

    const updated = await prisma.incident.update({
      where: { id: incidentId },
      data: {
        status: 'closed',
        updatedAt: new Date(),
      },
    });

    // Audit log
    await auditService.logAction(supportUserId, 'INCIDENT_CLOSED', 'Incident', incidentId, {
      incidentId,
    });

    return updated;
  },

  /**
   * Récupère les incidents urgents nécessitant une attention immédiate (Story 9.3)
   */
  async getUrgentIncidents() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const urgentIncidents = await prisma.incident.findMany({
      where: {
        status: 'reported',
        isUrgent: true,
        createdAt: {
          gte: thirtyMinutesAgo,
        },
        acknowledgedAt: null, // Pas encore accusé réception
      },
      include: {
        booking: {
          include: {
            tenant: {
              select: {
                id: true,
                email: true,
                profilePictureUrl: true,
              },
            },
            listing: {
              select: {
                id: true,
                title: true,
                address: true,
                host: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Plus anciens en premier
      },
    });

    return urgentIncidents.map((incident) => {
      const minutesSinceReport = Math.floor(
        (Date.now() - incident.createdAt.getTime()) / (1000 * 60)
      );
      return {
        ...incident,
        minutesSinceReport,
        isOverSLA: minutesSinceReport >= 30,
      };
    });
  },
};
