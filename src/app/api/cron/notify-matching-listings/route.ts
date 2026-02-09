import { NextRequest, NextResponse } from 'next/server';
import { matchingService } from '@/server/services/listings/matching.service';
import { notificationService } from '@/server/services/notifications/notification.service';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/cron/notify-matching-listings
 * 
 * Job cron pour notifier les utilisateurs des nouvelles annonces correspondant à leurs critères (Story 6.7)
 * 
 * Sécurisé avec CRON_SECRET
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier le secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer tous les locataires avec notifications activées
    const tenants = await prisma.user.findMany({
      where: {
        userType: 'tenant',
        notificationPreferences: {
          notifyMatchingListing: true,
        },
      },
      select: {
        id: true,
      },
    });

    let notifiedCount = 0;
    const errors: string[] = [];

    for (const tenant of tenants) {
      try {
        // Trouver les annonces correspondantes publiées dans les dernières 24h
        const matches = await matchingService.findMatchingListings(tenant.id);

        if (matches.length > 0) {
          // Envoyer une notification groupée
          await notificationService.sendNotification(tenant.id, 'matching_listing', {
            title: `${matches.length} nouvelle(s) annonce(s) correspondant à vos critères`,
            message:
              matches.length === 1
                ? `Une nouvelle annonce "${matches[0].title}" correspond à vos critères.`
                : `${matches.length} nouvelles annonces correspondent à vos critères.`,
            url: '/listings',
            listingTitle: matches[0]?.title,
          });

          notifiedCount++;
        }
      } catch (error) {
        errors.push(`Erreur pour utilisateur ${tenant.id}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      }
    }

    return NextResponse.json(
      {
        success: true,
        notifiedUsers: notifiedCount,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la notification des annonces correspondantes:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la notification',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
