'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface ListingRulesSectionProps {
  listingId: string;
}

interface Rules {
  smoking?: 'allowed' | 'not_allowed' | 'outside_only';
  pets?: 'allowed' | 'not_allowed' | 'case_by_case';
  quietHours?: string;
  parties?: 'allowed' | 'not_allowed' | 'weekends_only';
  guests?: 'allowed' | 'not_allowed' | 'with_notice';
  cleaning?: 'shared' | 'rotating' | 'professional';
  cooking?: 'shared' | 'individual' | 'flexible';
}

export function ListingRulesSection({ listingId }: ListingRulesSectionProps) {
  const [rules, setRules] = useState<Rules>({});
  const [charter, setCharter] = useState('');
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
      
      if (data.data.rules && typeof data.data.rules === 'object') {
        setRules(data.data.rules as Rules);
      }
      setCharter(data.data.charter || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/listings/${listingId}/rules`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules, charter }),
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
        <h2 className="text-2xl font-bold">Règles et charte</h2>
        <p className="text-muted-foreground">
          Définissez les règles de vie et la charte de votre colocation
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
          Règles et charte sauvegardées avec succès
        </div>
      )}

      {/* Règles */}
      <div className="space-y-4 rounded-lg border p-6">
        <h3 className="text-lg font-semibold">Règles de la colocation</h3>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="smoking">Fumeurs</Label>
            <Select
              value={rules.smoking || ''}
              onValueChange={(value) =>
                setRules((prev) => ({ ...prev, smoking: value as Rules['smoking'] }))
              }
            >
              <SelectTrigger id="smoking">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_allowed">Interdit</SelectItem>
                <SelectItem value="outside_only">Extérieur uniquement</SelectItem>
                <SelectItem value="allowed">Autorisé</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pets">Animaux</Label>
            <Select
              value={rules.pets || ''}
              onValueChange={(value) =>
                setRules((prev) => ({ ...prev, pets: value as Rules['pets'] }))
              }
            >
              <SelectTrigger id="pets">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_allowed">Interdits</SelectItem>
                <SelectItem value="case_by_case">Au cas par cas</SelectItem>
                <SelectItem value="allowed">Autorisés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quietHours">Heures de calme</Label>
            <input
              id="quietHours"
              type="text"
              placeholder="Ex: 22h-8h"
              value={rules.quietHours || ''}
              onChange={(e) =>
                setRules((prev) => ({ ...prev, quietHours: e.target.value }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parties">Fêtes</Label>
            <Select
              value={rules.parties || ''}
              onValueChange={(value) =>
                setRules((prev) => ({ ...prev, parties: value as Rules['parties'] }))
              }
            >
              <SelectTrigger id="parties">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_allowed">Interdites</SelectItem>
                <SelectItem value="weekends_only">Week-ends uniquement</SelectItem>
                <SelectItem value="allowed">Autorisées</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests">Invités</Label>
            <Select
              value={rules.guests || ''}
              onValueChange={(value) =>
                setRules((prev) => ({ ...prev, guests: value as Rules['guests'] }))
              }
            >
              <SelectTrigger id="guests">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="not_allowed">Interdits</SelectItem>
                <SelectItem value="with_notice">Avec préavis</SelectItem>
                <SelectItem value="allowed">Autorisés</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cleaning">Nettoyage</Label>
            <Select
              value={rules.cleaning || ''}
              onValueChange={(value) =>
                setRules((prev) => ({ ...prev, cleaning: value as Rules['cleaning'] }))
              }
            >
              <SelectTrigger id="cleaning">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shared">Partagé</SelectItem>
                <SelectItem value="rotating">Rotation</SelectItem>
                <SelectItem value="professional">Professionnel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cooking">Cuisine</Label>
            <Select
              value={rules.cooking || ''}
              onValueChange={(value) =>
                setRules((prev) => ({ ...prev, cooking: value as Rules['cooking'] }))
              }
            >
              <SelectTrigger id="cooking">
                <SelectValue placeholder="Sélectionner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shared">Partagée</SelectItem>
                <SelectItem value="individual">Individuelle</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Charte */}
      <div className="space-y-4 rounded-lg border p-6">
        <div>
          <Label htmlFor="charter">Charte de vie en coloc</Label>
          <p className="text-sm text-muted-foreground">
            Décrivez les valeurs, le style de vie et les attentes de votre colocation
          </p>
        </div>
        <Textarea
          id="charter"
          placeholder="Ex: Nous sommes une coloc calme et respectueuse, privilégiant les échanges bienveillants..."
          value={charter}
          onChange={(e) => setCharter(e.target.value)}
          rows={6}
          maxLength={2000}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {charter.length} / 2000 caractères
        </p>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sauvegarde...
          </>
        ) : (
          'Enregistrer les règles et la charte'
        )}
      </Button>
    </div>
  );
}
