'use client';

import { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CreditCard, CheckCircle2, AlertTriangle, X, WifiOff } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';

// Initialiser Stripe avec la clé publique
const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

interface PaymentFlowProps {
  bookingId: string;
  amount: number; // Montant en centimes (2500 = 25€)
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Composant interne pour le formulaire de paiement Stripe
 */
function PaymentForm({ bookingId, amount, onSuccess, onCancel }: PaymentFlowProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const isOffline = useOffline();

  // Récupérer le client secret depuis l'API
  useEffect(() => {
    async function fetchClientSecret() {
      try {
        // Note: Pour une préautorisation, on n'a pas besoin de client secret
        // On va créer directement le Payment Intent côté serveur
        // Cette étape est optionnelle si on veut utiliser Stripe Elements avec Setup Intent
      } catch (err) {
        console.error('Erreur lors de la récupération du client secret:', err);
      }
    }
    // fetchClientSecret();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Vérifier le mode hors ligne (Story 5.10)
    if (isOffline) {
      setError(
        'Vous êtes hors ligne. Le paiement sera mis en attente et effectué dès la reconnexion.'
      );
      // TODO: Mettre en queue le paiement pour traitement ultérieur
      return;
    }

    if (!stripe || !elements) {
      setError('Stripe n\'est pas encore chargé. Veuillez patienter...');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Élément de carte non trouvé');
      return;
    }

    setIsProcessing(true);

    try {
      // Créer la méthode de paiement
      const { error: createError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (createError) {
        throw new Error(createError.message || 'Erreur lors de la création de la méthode de paiement');
      }

      if (!paymentMethod) {
        throw new Error('Impossible de créer la méthode de paiement');
      }

      // Appeler l'API pour créer la préautorisation
      const response = await fetch(`/api/bookings/${bookingId}/payment/preauthorize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Gérer les erreurs spécifiques
        if (result.code === 'CARD_DECLINED') {
          throw new Error('Votre carte a été refusée. Veuillez vérifier vos informations ou utiliser une autre carte.');
        }
        if (result.code === 'INVALID_PAYMENT_METHOD') {
          throw new Error('Méthode de paiement invalide. Veuillez réessayer.');
        }
        if (result.code === 'PAYMENT_ATTEMPT_FAILED') {
          throw new Error('Le paiement a échoué. Veuillez réessayer.');
        }
        throw new Error(result.error || 'Erreur lors de la création de la préautorisation');
      }

      // Succès
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue lors du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (cents: number) => {
    return (cents / 100).toFixed(2);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Sécuriser votre réservation</h3>
          <p className="text-sm text-muted-foreground">
            Une préautorisation de <strong>{(amount / 100).toFixed(2)}€</strong> sera effectuée sur votre carte.
            Le paiement sera capturé uniquement après validation par le propriétaire.
          </p>
        </div>

        {isOffline && (
          <Alert className="mb-4 bg-yellow-50 border-yellow-200">
            <WifiOff className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Mode hors ligne</AlertTitle>
            <AlertDescription className="text-yellow-700">
              <p className="text-sm">
                Vous êtes hors ligne. Le paiement sera mis en attente et effectué dès la reconnexion.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Informations de carte</label>
            <div className="rounded-lg border p-4 bg-background">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Montant de la préautorisation :</span>
              <span className="font-semibold text-lg">{(amount / 100).toFixed(2)}€</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Aucun débit ne sera effectué immédiatement. Le paiement sera capturé après validation par le propriétaire.
            </p>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isProcessing || !stripe}
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Sécuriser la réservation
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

/**
 * Mode simulation quand Stripe n'est pas configuré (développement)
 */
function PaymentSimulateFlow({
  bookingId,
  amount,
  onSuccess,
  onCancel,
}: PaymentFlowProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/payment/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur simulation');
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-amber-500/20">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Mode développement</h3>
          <p className="text-sm text-zinc-400 mt-1">
            Stripe n&apos;est pas configuré. Vous pouvez simuler la préautorisation de{' '}
            <strong className="text-white">{(amount / 100).toFixed(2)}€</strong> pour tester le parcours.
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isProcessing}
          className="border-white/10"
        >
          Annuler
        </Button>
        <Button
          onClick={handleSimulate}
          disabled={isProcessing}
          className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-medium"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Simulation...
            </>
          ) : (
            <>Simuler la préautorisation ({(amount / 100).toFixed(2)}€)</>
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * Composant principal pour le flux de paiement (Story 5.3)
 */
export function PaymentFlow({ bookingId, amount, onSuccess, onCancel }: PaymentFlowProps) {
  const [status, setStatus] = useState<'form' | 'success' | 'error'>('form');
  const [error, setError] = useState<string | null>(null);

  // Si Stripe n'est pas configuré : proposer la simulation en dev
  if (!stripePromise) {
    return <PaymentSimulateFlow bookingId={bookingId} amount={amount} onSuccess={onSuccess} onCancel={onCancel} />;
  }

  const options: StripeElementsOptions = {
    mode: 'payment',
    amount: amount,
    currency: 'eur',
    appearance: {
      theme: 'stripe',
    },
  };

  const handleSuccess = () => {
    setStatus('success');
    setTimeout(() => {
      onSuccess();
    }, 2000);
  };

  if (status === 'success') {
    return (
      <div className="rounded-lg border bg-card p-6 text-center">
        <div className="mb-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">Réservation sécurisée !</h3>
        <p className="text-muted-foreground mb-4">
          Votre préautorisation de {(amount / 100).toFixed(2)}€ a été effectuée avec succès.
          Le paiement sera capturé après validation par le propriétaire.
        </p>
        <p className="text-sm text-muted-foreground">Redirection en cours...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={options}>
      <PaymentForm
        bookingId={bookingId}
        amount={amount}
        onSuccess={handleSuccess}
        onCancel={onCancel}
      />
    </Elements>
  );
}

