'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, Plus, X } from 'lucide-react';

interface CheckInInstructionsEditorProps {
  listingId: string;
}

interface AccessCode {
  key: string;
  value: string;
}

/**
 * Éditeur d'instructions de check-in pour les hôtes (Story 8.4)
 */
export function CheckInInstructionsEditor({ listingId }: CheckInInstructionsEditorProps) {
  const [address, setAddress] = useState('');
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [hostPhone, setHostPhone] = useState('');
  const [hostEmail, setHostEmail] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInstructions();
  }, [listingId]);

  const loadInstructions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/listings/${listingId}/checkin-instructions`);
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      if (data.data) {
        setAddress(data.data.address || '');
        setHostPhone(data.data.hostPhone || '');
        setHostEmail(data.data.hostEmail || '');
        setInstructions(data.data.instructions || '');
        if (data.data.accessCodes) {
          setAccessCodes(Object.entries(data.data.accessCodes).map(([key, value]) => ({ key, value: value as string })));
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const addAccessCode = () => {
    setAccessCodes([...accessCodes, { key: '', value: '' }]);
  };

  const removeAccessCode = (index: number) => {
    setAccessCodes(accessCodes.filter((_, i) => i !== index));
  };

  const updateAccessCode = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...accessCodes];
    updated[index][field] = value;
    setAccessCodes(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const accessCodesObj: Record<string, string> = {};
      accessCodes.forEach((code) => {
        if (code.key && code.value) {
          accessCodesObj[code.key] = code.value;
        }
      });

      const response = await fetch(`/api/listings/${listingId}/checkin-instructions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          accessCodes: Object.keys(accessCodesObj).length > 0 ? accessCodesObj : undefined,
          hostPhone: hostPhone || undefined,
          hostEmail: hostEmail || undefined,
          instructions: instructions || undefined,
        }),
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
        <h3 className="text-lg font-semibold">Instructions de check-in</h3>
        <p className="text-sm text-muted-foreground">
          Configurez les informations que les locataires verront lors de leur arrivée
        </p>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Instructions sauvegardées avec succès
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Adresse */}
        <div>
          <Label htmlFor="address">Adresse complète *</Label>
          <Input
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Ex: 123 Rue de la Plage, 75001 Paris"
            className="mt-1"
            required
          />
        </div>

        {/* Codes d'accès */}
        <div>
          <Label>Codes d'accès (optionnel)</Label>
          <div className="mt-2 space-y-2">
            {accessCodes.map((code, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  placeholder="Ex: Porte principale"
                  value={code.key}
                  onChange={(e) => updateAccessCode(index, 'key', e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Code"
                  value={code.value}
                  onChange={(e) => updateAccessCode(index, 'value', e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeAccessCode(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addAccessCode} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un code
            </Button>
          </div>
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="host-phone">Téléphone (optionnel)</Label>
            <Input
              id="host-phone"
              type="tel"
              value={hostPhone}
              onChange={(e) => setHostPhone(e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="host-email">Email (optionnel)</Label>
            <Input
              id="host-email"
              type="email"
              value={hostEmail}
              onChange={(e) => setHostEmail(e.target.value)}
              placeholder="contact@example.com"
              className="mt-1"
            />
          </div>
        </div>

        {/* Instructions */}
        <div>
          <Label htmlFor="instructions">Instructions supplémentaires (optionnel)</Label>
          <Textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="Ex: Sonner à la porte bleue, utiliser l'entrée de service..."
            maxLength={2000}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {instructions.length}/2000 caractères
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving || !address} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sauvegarde...
            </>
          ) : (
            'Sauvegarder les instructions'
          )}
        </Button>
      </div>
    </div>
  );
}
