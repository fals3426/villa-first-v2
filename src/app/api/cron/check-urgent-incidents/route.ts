import { NextRequest, NextResponse } from 'next/server';
import { incidentManagementService } from '@/server/services/support/incident-management.service';
import { notificationService } from '@/server/services/notifications/notification.service';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/cron/check-urgent-incidents
 * 
 * Cron job pour vérifier les incidents urgents et déclencher l'escalade si nécessaire (Story 9.3)
 * À appeler toutes les 5 minutes
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier le secret cron
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const urgentIncidents = await incidentManagementService.getUrgentIncidents();

    // Vérifier les incidents qui dépassent le SLA (30 minutes)
    const now = Date.now();
    const thirtyMinutes = 30 * 60 * 1000;

    for (const incident of urgentIncidents) {
      const timeSinceReport = now - incident.createdAt.getTime();

      if (timeSinceReport >= thirtyMinutes && !incident.acknowledgedAt) {
        // Escalade automatique : notifier tous les utilisateurs support
        const supportUsers = await prisma.user.findMany({
          where: {
            userType: 'support',
          },
          select: {
            id: true,
            email: true,
          },
        });

        // Notifier chaque membre du support
        for (const supportUser of supportUsers) {
          await notificationService.sendNotification(supportUser.id, 'check_in_issue', {
            title: '⚠️ ESCALADE : Incident urgent non pris en charge',
            message: `L'incident "${incident.booking.listing.title}" n'a pas été pris en charge dans les 30 minutes. Action immédiate requise.`,
            url: `/admin/incidents/${incident.id}`,
            listingTitle: incident.booking.listing.title,
          }).catch((err) => {
            console.error('Erreur lors de l\'envoi de la notification d\'escalade:', err);
          });
        }

        // Audit log pour l'escalade
        await prisma.auditLog.create({
          data: {
            action: 'INCIDENT_ESCALATED',
            entityType: 'Incident',
            entityId: incident.id,
            details: {
              incidentId: incident.id,
              minutesSinceReport: Math.floor(timeSinceReport / (1000 * 60)),
              reason: 'SLA_30MIN_EXCEEDED',
            },
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          checked: urgentIncidents.length,
          escalated: urgentIncidents.filter(
            (inc) => !inc.acknowledgedAt && Date.now() - inc.createdAt.getTime() >= thirtyMinutes
          ).length,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la vérification des incidents urgents:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
