import { prisma } from '@/lib/prisma';
import { completenessService } from '@/server/services/listings/completeness.service';

/**
 * Service pour synchroniser automatiquement les calendriers (Story 3.8)
 */
export const calendarSyncService = {
  /**
   * Synchronise le calendrier d'une annonce spécifique
   * Met à jour les créneaux selon les réservations existantes
   */
  async syncListingCalendar(listingId: string): Promise<{
    updated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let updated = 0;

    try {
      // Récupérer toutes les réservations confirmées pour cette annonce
      // Note: Pour le MVP, on suppose qu'il n'y a pas encore de modèle Reservation
      // Cette fonction sera étendue quand Epic 5 sera implémenté
      
      // Pour l'instant, on synchronise simplement en recalculant le score de complétude
      // et en s'assurant que les créneaux existants sont cohérents
      
      // Vérifier que l'annonce existe
      const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        select: { id: true },
      });

      if (!listing) {
        errors.push(`Annonce ${listingId} introuvable`);
        return { updated, errors };
      }

      // Recalculer le score de complétude (qui prend en compte les créneaux de disponibilité)
      await completenessService.recalculateAndPersistCompleteness(listingId);
      
      updated = 1;

      // TODO: Quand Epic 5 sera implémenté, ajouter ici la logique pour :
      // 1. Récupérer les réservations confirmées
      // 2. Marquer les dates correspondantes comme indisponibles (isAvailable = false)
      // 3. Préserver les créneaux manuels de l'hôte
    } catch (error: any) {
      const errorMessage = `Erreur lors de la synchronisation: ${error.message}`;
      errors.push(errorMessage);
      
      // Créer une alerte pour le support (Story 9.8)
      try {
        // Compter les tentatives précédentes
        const previousFailures = await prisma.auditLog.count({
          where: {
            entityType: 'Listing',
            entityId: listingId,
            action: 'CALENDAR_SYNC_FAILURE',
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Dernières 24h
            },
          },
        });

        const { calendarAlertService } = await import('@/server/services/support/calendar-alert.service');
        await calendarAlertService.createSyncFailureAlert(
          listingId,
          'SYNC_ERROR',
          error.message || 'Erreur inconnue',
          previousFailures + 1
        );
      } catch (alertError) {
        console.error('Erreur lors de la création de l\'alerte:', alertError);
      }
    }

    return { updated, errors };
  },

  /**
   * Synchronise tous les calendriers des annonces actives
   * Appelé par le cron job toutes les 30 minutes
   */
  async syncAllListings(): Promise<{
    processed: number;
    updated: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let processed = 0;
    let updated = 0;

    try {
      // Récupérer toutes les annonces publiées
      const listings = await prisma.listing.findMany({
        where: {
          status: 'published',
        },
        select: { id: true },
      });

      for (const listing of listings) {
        try {
          const result = await this.syncListingCalendar(listing.id);
          processed++;
          updated += result.updated;
          if (result.errors.length > 0) {
            errors.push(...result.errors.map((e) => `[${listing.id}] ${e}`));
          }
        } catch (error: any) {
          const errorMessage = `[${listing.id}] ${error.message}`;
          errors.push(errorMessage);
          
          // Créer une alerte pour le support (Story 9.8)
          try {
            // Compter les tentatives précédentes
            const previousFailures = await prisma.auditLog.count({
              where: {
                entityType: 'Listing',
                entityId: listing.id,
                action: 'CALENDAR_SYNC_FAILURE',
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Dernières 24h
                },
              },
            });

            const { calendarAlertService } = await import('@/server/services/support/calendar-alert.service');
            await calendarAlertService.createSyncFailureAlert(
              listing.id,
              'SYNC_ERROR',
              error.message || 'Erreur inconnue',
              previousFailures + 1
            );
          } catch (alertError) {
            console.error('Erreur lors de la création de l\'alerte:', alertError);
          }
        }
      }
    } catch (error: any) {
      errors.push(`Erreur globale: ${error.message}`);
    }

    return { processed, updated, errors };
  },
};
