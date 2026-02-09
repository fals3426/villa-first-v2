import { NextRequest, NextResponse } from 'next/server';
import { watchlistService } from '@/server/services/listings/watchlist.service';
import { notificationService } from '@/server/services/notifications/notification.service';

/**
 * POST /api/cron/notify-available-places
 * 
 * Job cron pour notifier les utilisateurs quand une place se libère dans une coloc suivie (Story 6.8)
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

    // Trouver toutes les annonces suivies avec des places disponibles
    const listingsWithPlaces = await watchlistService.findListingsWithAvailablePlaces();

    let notifiedCount = 0;
    const errors: string[] = [];

    for (const item of listingsWithPlaces) {
      try {
        // Vérifier que l'utilisateur a activé ce type de notification
        const { prisma } = await import('@/lib/prisma');
        const prefs = await prisma.notificationPreferences.findUnique({
          where: { userId: item.userId },
        });

        if (!prefs?.notifyPlaceAvailable) {
          continue;
        }

        // Envoyer la notification
        await notificationService.sendNotification(item.userId, 'place_available', {
          title: 'Place disponible',
          message: `Une place s'est libérée dans "${item.listingTitle}"`,
          url: `/listings/${item.listingId}`,
          listingTitle: item.listingTitle,
        });

        // Marquer comme notifié
        await watchlistService.markAsNotified(item.watchedListingId);

        notifiedCount++;
      } catch (error) {
        errors.push(
          `Erreur pour listing ${item.listingId}, utilisateur ${item.userId}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        notifiedUsers: notifiedCount,
        listingsChecked: listingsWithPlaces.length,
        errors: errors.length > 0 ? errors : undefined,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la notification des places disponibles:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la notification',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
