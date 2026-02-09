import { prisma } from '@/lib/prisma';

/**
 * Service pour le back-office support (Story 9.1)
 */
export const supportService = {
  /**
   * Récupère les statistiques du dashboard support (Story 9.1)
   */
  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Statistiques des incidents (Story 9.2)
    const incidentsStats = await prisma.incident.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    const incidentsByStatus = incidentsStats.reduce(
      (acc, stat) => {
        acc[stat.status] = stat._count.id;
        return acc;
      },
      {} as Record<string, number>
    );

    // Incidents urgents (créés dans les dernières 30 minutes) (Story 9.3)
    const urgentIncidents = await prisma.incident.count({
      where: {
        status: 'reported',
        createdAt: {
          gte: new Date(now.getTime() - 30 * 60 * 1000), // 30 minutes
        },
      },
    });

    // Vérifications en attente (Epic 2)
    const pendingVerifications = await prisma.verificationRequest.count({
      where: {
        status: 'pending',
      },
    });

    const inReviewVerifications = await prisma.verificationRequest.count({
      where: {
        status: 'in_review',
      },
    });

    // Réservations en cours
    const activeBookings = await prisma.booking.count({
      where: {
        status: {
          in: ['confirmed', 'accepted'],
        },
        checkOut: {
          gte: now,
        },
      },
    });

    // Utilisateurs actifs (derniers 30 jours)
    const activeUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Annonces suspendues
    const suspendedListings = await prisma.listing.count({
      where: {
        status: 'suspended',
      },
    });

    // Réservations avec incidents
    const bookingsWithIncidents = await prisma.booking.count({
      where: {
        status: 'incident_reported',
      },
    });

    return {
      incidents: {
        total: Object.values(incidentsByStatus).reduce((a, b) => a + b, 0),
        reported: incidentsByStatus.reported || 0,
        in_progress: incidentsByStatus.in_progress || 0,
        resolved: incidentsByStatus.resolved || 0,
        closed: incidentsByStatus.closed || 0,
        urgent: urgentIncidents,
      },
      verifications: {
        pending: pendingVerifications,
        inReview: inReviewVerifications,
        total: pendingVerifications + inReviewVerifications,
      },
      bookings: {
        active: activeBookings,
        withIncidents: bookingsWithIncidents,
      },
      users: {
        activeLast30Days: activeUsers,
      },
      listings: {
        suspended: suspendedListings,
      },
    };
  },
};
