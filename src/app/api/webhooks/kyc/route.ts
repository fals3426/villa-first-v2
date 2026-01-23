import { NextResponse } from 'next/server';
import { kycService } from '@/server/services/kyc/kyc.service';
import { MockKycProvider } from '@/lib/kyc/provider';

/**
 * Webhook handler pour les callbacks KYC
 * Pour Stripe Identity, vérifier la signature avec stripe.webhooks.constructEvent
 * Pour l'instant, utilise MockKycProvider pour simuler les callbacks
 */

/**
 * Webhook handler pour les callbacks KYC
 * Pour Stripe Identity, vérifier la signature avec stripe.webhooks.constructEvent
 * Pour l'instant, utilise MockKycProvider pour simuler les callbacks
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Pour le mock provider, simuler un callback après vérification
    // En production avec Stripe, vérifier la signature ici
    if (body.type === 'mock_verification_complete' && body.providerId) {
      const mockProvider = new MockKycProvider();
      const status = await mockProvider.checkStatus(body.providerId);

      if (status === 'verified' || status === 'rejected') {
        // Trouver l'utilisateur par providerId
        // Note: En production, utiliser le metadata du webhook Stripe
        const userId = body.userId;
        if (userId) {
          if (status === 'verified') {
            // Pour le mock, simuler des données vérifiées
            // En production avec Stripe, extraire depuis session.verified_outputs
            const verifiedData = {
              name: body.verifiedName || 'John Doe', // À remplacer par données réelles
              dateOfBirth: body.verifiedDateOfBirth || '1990-01-01',
              nationality: body.verifiedNationality || 'FR',
            };
            await kycService.storeVerifiedData(userId, verifiedData);
          } else {
            await kycService.updateStatus(
              userId,
              status,
              'Document non valide'
            );
          }

          // TODO: Envoyer notification
          // await notificationService.sendKycStatusUpdate(userId, status);
        }
      }
    }

    // Pour Stripe Identity (à implémenter):
    // const signature = headers().get('stripe-signature');
    // const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
    // if (event.type === 'identity.verification_session.verified') { ... }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing KYC webhook:', error);
    return NextResponse.json(
      { error: 'Invalid webhook' },
      { status: 400 }
    );
  }
}
