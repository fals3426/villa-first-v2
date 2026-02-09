import Stripe from 'stripe';

/**
 * Client Stripe singleton (Story 5.3)
 * Utilisé uniquement côté serveur
 */
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn(
    'STRIPE_SECRET_KEY is not defined. Stripe features will not work. Set it in .env.local for payment functionality.'
  );
}

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-12-15.clover',
    })
  : null;

/**
 * Vérifie si Stripe est configuré
 */
export function isStripeConfigured(): boolean {
  return stripe !== null && !!process.env.STRIPE_SECRET_KEY;
}

/**
 * Crée un Payment Intent pour préautorisation (Story 5.3)
 * @param amount Montant en centimes (ex: 2500 pour 25€)
 * @param paymentMethodId ID de la méthode de paiement Stripe
 * @param metadata Métadonnées à associer (bookingId, etc.)
 */
export async function createPaymentIntent(
  amount: number,
  paymentMethodId: string,
  metadata: Record<string, string> = {}
): Promise<Stripe.PaymentIntent> {
  if (!stripe) {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }

  return stripe.paymentIntents.create({
    amount,
    currency: 'eur',
    payment_method: paymentMethodId,
    capture_method: 'manual', // CRITIQUE: Préautorisation uniquement, pas de capture automatique
    confirmation_method: 'manual',
    confirm: true,
    metadata,
  });
}

/**
 * Capture un Payment Intent (Story 5.7)
 */
export async function capturePaymentIntent(
  paymentIntentId: string,
  amount?: number
): Promise<Stripe.PaymentIntent> {
  if (!stripe) {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }

  return stripe.paymentIntents.capture(paymentIntentId, {
    amount_to_capture: amount, // Si undefined, capture le montant total
  });
}

/**
 * Annule un Payment Intent (Story 5.2, 5.8)
 */
export async function cancelPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  if (!stripe) {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }

  return stripe.paymentIntents.cancel(paymentIntentId);
}

/**
 * Vérifie la signature d'un webhook Stripe (Story 5.7)
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event {
  if (!stripe) {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }

  return stripe.webhooks.constructEvent(payload, signature, secret);
}

/**
 * Récupère un Payment Intent (Story 5.4)
 */
export async function getPaymentIntent(
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> {
  if (!stripe) {
    throw new Error('STRIPE_NOT_CONFIGURED');
  }

  return stripe.paymentIntents.retrieve(paymentIntentId);
}
