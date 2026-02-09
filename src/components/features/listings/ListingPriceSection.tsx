'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, Euro } from 'lucide-react';

interface ListingPriceSectionProps {
  listingId: string;
}

export function ListingPriceSection({ listingId }: ListingPriceSectionProps) {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadListing();
  }, [listingId]);

  const loadListing = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setPrice(data.data.pricePerPlace || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (price === null || price <= 0) {
      setError('Le prix doit être supérieur à 0');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/listings/${listingId}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pricePerPlace: price }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Prix de la colocation</h2>
        <p className="text-muted-foreground">
          Définissez le prix par place pour votre colocation
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-700 dark:text-emerald-200 flex items-center gap-2" role="status">
          <CheckCircle2 className="h-4 w-4" />
          Prix sauvegardé avec succès
        </div>
      )}

      <div className="space-y-4 rounded-lg border p-6">
        <div className="space-y-2">
          <Label htmlFor="price">Prix par place (€/mois)</Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="price"
              type="number"
              min="1"
              max="10000"
              step="0.01"
              placeholder="Ex: 500"
              value={price ?? ''}
              onChange={(e) => {
                const value = e.target.value;
                setPrice(value === '' ? null : parseFloat(value));
              }}
              className="pl-9"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Prix mensuel par place en euros. Maximum : 10000€
          </p>
        </div>

        {price !== null && price > 0 && (
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm font-medium">Aperçu</p>
            <p className="text-lg font-bold">
              {price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} / mois / place
            </p>
          </div>
        )}

        <Button onClick={handleSave} disabled={saving || price === null || price <= 0} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            'Enregistrer le prix'
          )}
        </Button>
      </div>
    </div>
  );
}
