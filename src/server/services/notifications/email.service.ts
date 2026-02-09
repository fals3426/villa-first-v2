/**
 * Service pour les notifications email (Story 6.4)
 * 
 * Note: Pour une implémentation complète, utiliser SendGrid, Mailgun, ou Resend
 */
export const emailService = {
  /**
   * Envoie un email de notification (Story 6.4)
   */
  async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<{ sent: boolean; reason?: string }> {
    // TODO: Implémenter avec un service d'email tiers (SendGrid, Mailgun, Resend)
    // Pour l'instant, log pour développement
    console.log(`[Email] To: ${to}, Subject: ${subject}`);
    console.log(`[Email] Content: ${text || html.substring(0, 100)}...`);

    return { sent: true };
  },

  /**
   * Envoie une notification email pour un événement (Story 6.4)
   */
  async sendNotificationEmail(
    userId: string,
    userEmail: string,
    eventType: 'new_booking' | 'new_message' | 'validation' | 'check_in_issue' | 'matching_listing' | 'place_available',
    data: Record<string, unknown>
  ) {
    // Vérifier les préférences (sera fait dans notification.service.ts)
    
    const templates: Record<string, { subject: string; getContent: (data: Record<string, unknown>) => string }> = {
      new_booking: {
        subject: 'Nouvelle demande de réservation',
        getContent: (d) => `Vous avez reçu une nouvelle demande de réservation pour "${d.listingTitle || 'votre annonce'}".`,
      },
      new_message: {
        subject: 'Nouveau message',
        getContent: (d) => `Vous avez reçu un nouveau message dans le chat pour "${d.listingTitle || 'votre réservation'}".`,
      },
      validation: {
        subject: 'Colocation validée',
        getContent: (d) => `Votre réservation pour "${d.listingTitle || 'la colocation'}" a été validée !`,
      },
      check_in_issue: {
        subject: 'Problème lors du check-in',
        getContent: (d) => `Un problème a été signalé lors du check-in pour "${d.listingTitle || 'votre réservation'}".`,
      },
      matching_listing: {
        subject: 'Nouvelle annonce correspondant à vos critères',
        getContent: (d) => `Une nouvelle annonce "${d.listingTitle || ''}" correspond à vos critères de recherche.`,
      },
      place_available: {
        subject: 'Place disponible dans une coloc suivie',
        getContent: (d) => `Une place s'est libérée dans "${d.listingTitle || 'une coloc que vous suivez'}".`,
      },
    };

    const template = templates[eventType];
    if (!template) {
      return { sent: false, reason: 'Unknown event type' };
    }

    const content = template.getContent(data);
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>${template.subject}</h2>
        <p>${content}</p>
        ${data.url ? `<p><a href="${data.url}">Voir les détails</a></p>` : ''}
      </div>
    `;

    return this.sendEmail(userEmail, template.subject, html, content);
  },
};
