/**
 * Interface abstraite pour les providers KYC
 * Permet de changer facilement de provider (Stripe, Onfido, Sumsub, etc.)
 */
export interface KycProvider {
  initiateVerification(
    documentUrl: string,
    userId: string
  ): Promise<string>; // Retourne providerId
  checkStatus(
    providerId: string
  ): Promise<'pending' | 'verified' | 'rejected'>;
}

/**
 * Mock KYC Provider pour le développement
 * À remplacer par un vrai provider (Stripe Identity, Onfido, etc.) en production
 */
export class MockKycProvider implements KycProvider {
  private verifications: Map<
    string,
    { status: 'pending' | 'verified' | 'rejected'; userId: string }
  > = new Map();

  async initiateVerification(
    documentUrl: string,
    userId: string
  ): Promise<string> {
    // Simuler un délai
    await new Promise((resolve) => setTimeout(resolve, 500));

    const providerId = `mock_${Date.now()}_${userId}`;
    this.verifications.set(providerId, {
      status: 'pending',
      userId,
    });

    // Simuler une vérification automatique après 2 secondes (pour le dev)
    setTimeout(() => {
      const verification = this.verifications.get(providerId);
      if (verification) {
        // 90% de chance de succès en mock
        verification.status =
          Math.random() > 0.1 ? 'verified' : 'rejected';
      }
    }, 2000);

    return providerId;
  }

  async checkStatus(
    providerId: string
  ): Promise<'pending' | 'verified' | 'rejected'> {
    const verification = this.verifications.get(providerId);
    return verification?.status || 'pending';
  }
}

/**
 * Stripe Identity Provider (à implémenter avec les vraies clés API)
 */
export class StripeKycProvider implements KycProvider {
  private stripe: any;

  constructor() {
    // Note: Stripe sera installé et configuré plus tard
    // Pour l'instant, cette classe est un placeholder
    if (process.env.STRIPE_SECRET_KEY) {
      // const Stripe = require('stripe');
      // this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }
  }

  async initiateVerification(
    documentUrl: string,
    userId: string
  ): Promise<string> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    // TODO: Implémenter avec Stripe Identity
    // const verificationSession = await this.stripe.identity.verificationSessions.create({
    //   type: 'document',
    //   metadata: { userId },
    // });
    // return verificationSession.id;

    throw new Error('Stripe Identity not yet implemented');
  }

  async checkStatus(
    providerId: string
  ): Promise<'pending' | 'verified' | 'rejected'> {
    if (!this.stripe) {
      throw new Error('Stripe not configured');
    }

    // TODO: Implémenter avec Stripe Identity
    // const session = await this.stripe.identity.verificationSessions.retrieve(providerId);
    // if (session.status === 'verified') return 'verified';
    // if (session.status === 'requires_input') return 'rejected';
    // return 'pending';

    throw new Error('Stripe Identity not yet implemented');
  }
}

// Provider par défaut (mock pour le développement)
export const kycProvider: KycProvider = new MockKycProvider();
