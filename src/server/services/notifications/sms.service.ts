/**
 * Service pour les notifications SMS (Story 6.5)
 * 
 * Note: Pour une implémentation complète, utiliser Twilio ou un service SMS similaire
 */
export const smsService = {
  /**
   * Envoie un SMS de notification (Story 6.5)
   */
  async sendSMS(
    phoneNumber: string,
    message: string
  ): Promise<{ sent: boolean; reason?: string }> {
    // TODO: Implémenter avec Twilio ou service SMS tiers
    // Pour l'instant, log pour développement
    console.log(`[SMS] To: ${phoneNumber}, Message: ${message}`);

    return { sent: true };
  },

  /**
   * Envoie une notification SMS pour un événement critique (Story 6.5)
   */
  async sendNotificationSMS(
    userId: string,
    phoneNumber: string,
    eventType: 'validation' | 'check_in_issue',
    data: Record<string, unknown>
  ) {
    const templates: Record<string, (data: Record<string, unknown>) => string> = {
      validation: (d) => `Votre réservation pour "${d.listingTitle || 'la colocation'}" a été validée !`,
      check_in_issue: (d) => `Problème signalé lors du check-in pour "${d.listingTitle || 'votre réservation'}".`,
    };

    const template = templates[eventType];
    if (!template) {
      return { sent: false, reason: 'SMS only for critical events' };
    }

    const message = template(data);
    return this.sendSMS(phoneNumber, message);
  },
};
