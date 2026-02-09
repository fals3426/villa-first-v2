import { prisma } from '@/lib/prisma';
import { pushService } from './push.service';
import { emailService } from './email.service';
import { smsService } from './sms.service';

/**
 * Service centralisé pour les notifications (Stories 6.3, 6.4, 6.5, 6.6)
 */
export const notificationService = {
  /**
   * Envoie une notification via tous les canaux activés (Story 6.6)
   */
  async sendNotification(
    userId: string,
    eventType: 'new_booking' | 'new_message' | 'validation' | 'check_in_issue' | 'matching_listing' | 'place_available',
    data: {
      title: string;
      message: string;
      url?: string;
      listingTitle?: string;
      [key: string]: unknown;
    }
  ) {
    // Récupérer les préférences
    const prefs = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!prefs) {
      // Créer des préférences par défaut
      await prisma.notificationPreferences.create({
        data: { userId },
      });
      return { sent: false, reason: 'No preferences set' };
    }

    // Vérifier si ce type d'événement est activé
    const eventEnabled = {
      new_booking: prefs.notifyNewBooking,
      new_message: prefs.notifyNewMessage,
      validation: prefs.notifyValidation,
      check_in_issue: prefs.notifyCheckInIssue,
      matching_listing: prefs.notifyMatchingListing,
      place_available: prefs.notifyPlaceAvailable,
    }[eventType];

    if (!eventEnabled) {
      return { sent: false, reason: 'Event type disabled in preferences' };
    }

    const results: Record<string, unknown> = {};

    // Push notifications (Story 6.3)
    if (prefs.pushEnabled) {
      results.push = await pushService.sendNotification(userId, {
        title: data.title,
        message: data.message,
        url: data.url,
        data,
      });
    }

    // Email notifications (Story 6.4)
    if (prefs.emailEnabled) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      });
      if (user?.email) {
        results.email = await emailService.sendNotificationEmail(
          userId,
          user.email,
          eventType,
          data
        );
      }
    }

    // SMS notifications (Story 6.5) - seulement pour événements critiques
    if (prefs.smsEnabled && (eventType === 'validation' || eventType === 'check_in_issue')) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true },
      });
      if (user?.phone) {
        results.sms = await smsService.sendNotificationSMS(
          userId,
          user.phone,
          eventType,
          data
        );
      }
    }

    return results;
  },

  /**
   * Récupère les préférences de notifications d'un utilisateur (Story 6.6)
   */
  async getPreferences(userId: string) {
    let prefs = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!prefs) {
      // Créer des préférences par défaut
      prefs = await prisma.notificationPreferences.create({
        data: { userId },
      });
    }

    return prefs;
  },

  /**
   * Met à jour les préférences de notifications (Story 6.6)
   */
  async updatePreferences(
    userId: string,
    updates: {
      pushEnabled?: boolean;
      emailEnabled?: boolean;
      smsEnabled?: boolean;
      notifyNewBooking?: boolean;
      notifyNewMessage?: boolean;
      notifyValidation?: boolean;
      notifyCheckInIssue?: boolean;
      notifyMatchingListing?: boolean;
      notifyPlaceAvailable?: boolean;
    }
  ) {
    return prisma.notificationPreferences.upsert({
      where: { userId },
      create: {
        userId,
        ...updates,
      },
      update: updates,
    });
  },
};
