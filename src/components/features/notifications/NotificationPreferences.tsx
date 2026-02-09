'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Bell, CheckCircle2 } from 'lucide-react';

interface NotificationPreferences {
  id: string;
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  notifyNewBooking: boolean;
  notifyNewMessage: boolean;
  notifyValidation: boolean;
  notifyCheckInIssue: boolean;
  notifyMatchingListing: boolean;
  notifyPlaceAvailable: boolean;
}

/**
 * Composant pour gérer les préférences de notifications (Story 6.6)
 */
export function NotificationPreferences() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/notifications/preferences');
      if (!response.ok) throw new Error('Erreur lors du chargement');
      const data = await response.json();
      setPrefs(data.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!prefs) return;

    try {
      setSaving(true);
      setSuccess(false);
      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });

      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updatePref = (key: keyof NotificationPreferences, value: boolean) => {
    if (!prefs) return;
    setPrefs({ ...prefs, [key]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!prefs) {
    return <div>Erreur lors du chargement des préférences</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Bell className="h-6 w-6" />
          Préférences de notifications
        </h2>
        <p className="text-muted-foreground mt-2">
          Configurez comment vous souhaitez recevoir les notifications
        </p>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Préférences sauvegardées avec succès
          </AlertDescription>
        </Alert>
      )}

      {/* Canaux de notification */}
      <div className="space-y-4 rounded-lg border p-6">
        <h3 className="font-semibold text-lg">Canaux de notification</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="pushEnabled" className="cursor-pointer">
              Notifications push (mobile)
            </Label>
            <input
              type="checkbox"
              id="pushEnabled"
              checked={prefs.pushEnabled}
              onChange={(e) => updatePref('pushEnabled', e.target.checked)}
              className="h-4 w-4 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="emailEnabled" className="cursor-pointer">
              Notifications email
            </Label>
            <input
              type="checkbox"
              id="emailEnabled"
              checked={prefs.emailEnabled}
              onChange={(e) => updatePref('emailEnabled', e.target.checked)}
              className="h-4 w-4 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="smsEnabled" className="cursor-pointer">
              Notifications SMS (événements critiques uniquement)
            </Label>
            <input
              type="checkbox"
              id="smsEnabled"
              checked={prefs.smsEnabled}
              onChange={(e) => updatePref('smsEnabled', e.target.checked)}
              className="h-4 w-4 rounded"
            />
          </div>
        </div>
      </div>

      {/* Types d'événements */}
      <div className="space-y-4 rounded-lg border p-6">
        <h3 className="font-semibold text-lg">Types d'événements</h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="notifyNewBooking" className="cursor-pointer">
              Nouvelles demandes de réservation
            </Label>
            <input
              type="checkbox"
              id="notifyNewBooking"
              checked={prefs.notifyNewBooking}
              onChange={(e) => updatePref('notifyNewBooking', e.target.checked)}
              className="h-4 w-4 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifyNewMessage" className="cursor-pointer">
              Nouveaux messages
            </Label>
            <input
              type="checkbox"
              id="notifyNewMessage"
              checked={prefs.notifyNewMessage}
              onChange={(e) => updatePref('notifyNewMessage', e.target.checked)}
              className="h-4 w-4 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifyValidation" className="cursor-pointer">
              Validation de colocation
            </Label>
            <input
              type="checkbox"
              id="notifyValidation"
              checked={prefs.notifyValidation}
              onChange={(e) => updatePref('notifyValidation', e.target.checked)}
              className="h-4 w-4 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifyCheckInIssue" className="cursor-pointer">
              Problèmes check-in
            </Label>
            <input
              type="checkbox"
              id="notifyCheckInIssue"
              checked={prefs.notifyCheckInIssue}
              onChange={(e) => updatePref('notifyCheckInIssue', e.target.checked)}
              className="h-4 w-4 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifyMatchingListing" className="cursor-pointer">
              Annonces correspondant à mes critères
            </Label>
            <input
              type="checkbox"
              id="notifyMatchingListing"
              checked={prefs.notifyMatchingListing}
              onChange={(e) => updatePref('notifyMatchingListing', e.target.checked)}
              className="h-4 w-4 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifyPlaceAvailable" className="cursor-pointer">
              Places libérées dans colocs suivies
            </Label>
            <input
              type="checkbox"
              id="notifyPlaceAvailable"
              checked={prefs.notifyPlaceAvailable}
              onChange={(e) => updatePref('notifyPlaceAvailable', e.target.checked)}
              className="h-4 w-4 rounded"
            />
          </div>
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sauvegarde...
          </>
        ) : (
          'Sauvegarder les préférences'
        )}
      </Button>
    </div>
  );
}
