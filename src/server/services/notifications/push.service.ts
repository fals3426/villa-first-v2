import { prisma } from '@/lib/prisma';

/**
 * Service pour les notifications push (Story 6.3)
 * 
 * Note: Pour une implémentation complète, utiliser web-push avec VAPID keys
 * Pour l'instant, structure de base pour stocker les subscriptions
 */
export const pushService = {
  /**
   * Enregistre une subscription push pour un utilisateur (Story 6.3)
   */
  async subscribe(userId: string, subscription: { endpoint: string; keys: { p256dh: string; auth: string } }) {
    // Vérifier si la subscription existe déjà
    const existing = await prisma.pushSubscription.findUnique({
      where: {
        userId_endpoint: {
          userId,
          endpoint: subscription.endpoint,
        },
      },
    });

    if (existing) {
      // Mettre à jour
      return prisma.pushSubscription.update({
        where: { id: existing.id },
        data: {
          keys: subscription.keys as any,
          updatedAt: new Date(),
        },
      });
    }

    // Créer
    return prisma.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        keys: subscription.keys as any,
      },
    });
  },

  /**
   * Désinscrit un utilisateur d'une subscription push (Story 6.3)
   */
  async unsubscribe(userId: string, endpoint: string) {
    return prisma.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint,
      },
    });
  },

  /**
   * Récupère toutes les subscriptions push d'un utilisateur (Story 6.3)
   */
  async getUserSubscriptions(userId: string) {
    return prisma.pushSubscription.findMany({
      where: { userId },
    });
  },

  /**
   * Envoie une notification push (Story 6.3)
   * 
   * Note: Implémentation complète nécessite web-push avec VAPID keys
   */
  async sendNotification(
    userId: string,
    notification: {
      title: string;
      message: string;
      url?: string;
      data?: Record<string, unknown>;
    }
  ) {
    // Vérifier les préférences
    const prefs = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!prefs?.pushEnabled) {
      return { sent: false, reason: 'Push notifications disabled' };
    }

    // Récupérer les subscriptions
    const subscriptions = await this.getUserSubscriptions(userId);

    if (subscriptions.length === 0) {
      return { sent: false, reason: 'No subscriptions found' };
    }

    // TODO: Implémenter l'envoi réel avec web-push
    // Pour l'instant, retourner un succès simulé
    console.log(`[Push] Sending to ${subscriptions.length} subscriptions for user ${userId}:`, notification);

    return {
      sent: true,
      subscriptionsCount: subscriptions.length,
    };
  },
};
