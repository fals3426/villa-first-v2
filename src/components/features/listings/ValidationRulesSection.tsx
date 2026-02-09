'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ValidationRulesSectionProps {
  listingId: string;
}

type ValidationRule = 'FULL_ONLY' | 'PARTIAL' | 'MANUAL' | null;

interface ValidationRules {
  validationRule: ValidationRule;
  validationThreshold: number | null;
  capacity: number;
}

/**
 * Composant pour configurer les règles de validation (Story 5.5)
 */
export function ValidationRulesSection({ listingId }: ValidationRulesSectionProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [rules, setRules] = useState<ValidationRules>({
    validationRule: null,
    validationThreshold: null,
    capacity: 0,
  });

  useEffect(() => {
    loadRules();
  }, [listingId]);

  const loadRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/listings/${listingId}/validation-rules`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setRules(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      // Validation côté client
      if (rules.validationRule === 'PARTIAL' && (!rules.validationThreshold || rules.validationThreshold < 1 || rules.validationThreshold > 100)) {
        throw new Error('Le seuil doit être entre 1 et 100 pour la validation partielle');
      }

      const response = await fetch(`/api/listings/${listingId}/validation-rules`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          validationRule: rules.validationRule,
          validationThreshold: rules.validationRule === 'PARTIAL' ? rules.validationThreshold : undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la sauvegarde');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
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
        <h3 className="text-lg font-semibold mb-2">Règles de validation des réservations</h3>
        <p className="text-sm text-muted-foreground">
          Définissez comment les réservations seront validées pour cette annonce.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Règles sauvegardées</AlertTitle>
          <AlertDescription className="text-green-700">
            Les règles de validation ont été mises à jour avec succès.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Option 1: Villa complète uniquement */}
        <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <input
            type="radio"
            id="full_only"
            name="validationRule"
            value="FULL_ONLY"
            checked={rules.validationRule === 'FULL_ONLY'}
            onChange={() => setRules({ ...rules, validationRule: 'FULL_ONLY', validationThreshold: null })}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="full_only" className="font-medium cursor-pointer">
              Villa complète uniquement
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Validation automatique uniquement si toutes les {rules.capacity} places sont réservées.
            </p>
          </div>
        </div>

        {/* Option 2: Validation partielle */}
        <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <input
            type="radio"
            id="partial"
            name="validationRule"
            value="PARTIAL"
            checked={rules.validationRule === 'PARTIAL'}
            onChange={() =>
              setRules({
                ...rules,
                validationRule: 'PARTIAL',
                validationThreshold: rules.validationThreshold || 80,
              })
            }
            className="mt-1"
          />
          <div className="flex-1 space-y-3">
            <div>
              <Label htmlFor="partial" className="font-medium cursor-pointer">
                Validation partielle possible
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Validation automatique si un certain pourcentage des places est réservé.
              </p>
            </div>
            {rules.validationRule === 'PARTIAL' && (
              <div className="space-y-2">
                <Label htmlFor="threshold" className="text-sm">
                  Seuil de validation (%)
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="threshold"
                    type="number"
                    min="1"
                    max="100"
                    value={rules.validationThreshold || 80}
                    onChange={(e) =>
                      setRules({
                        ...rules,
                        validationThreshold: parseInt(e.target.value) || 80,
                      })
                    }
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">
                    % ({Math.ceil((rules.capacity * (rules.validationThreshold || 80)) / 100)} places sur {rules.capacity})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Option 3: Validation manuelle */}
        <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
          <input
            type="radio"
            id="manual"
            name="validationRule"
            value="MANUAL"
            checked={rules.validationRule === 'MANUAL'}
            onChange={() => setRules({ ...rules, validationRule: 'MANUAL', validationThreshold: null })}
            className="mt-1"
          />
          <div className="flex-1">
            <Label htmlFor="manual" className="font-medium cursor-pointer">
              Validation manuelle toujours requise
            </Label>
            <p className="text-sm text-muted-foreground mt-1">
              Aucune validation automatique. Vous devrez valider manuellement chaque réservation.
            </p>
          </div>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Note importante</AlertTitle>
        <AlertDescription className="text-sm">
          Les changements de règles s'appliquent uniquement aux nouvelles réservations.
          Les réservations en cours ne sont pas affectées.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || !rules.validationRule}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            'Sauvegarder les règles'
          )}
        </Button>
      </div>
    </div>
  );
}
