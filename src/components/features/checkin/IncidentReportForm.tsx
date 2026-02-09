'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, AlertTriangle, Upload, Camera } from 'lucide-react';
import Image from 'next/image';

interface IncidentReportFormProps {
  bookingId: string;
  onSuccess?: () => void;
}

/**
 * Formulaire de signalement d'incident (Story 8.5)
 */
export function IncidentReportForm({ bookingId, onSuccess }: IncidentReportFormProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'CODE_NOT_WORKING' | 'PLACE_DIFFERENT' | 'ACCESS_ISSUE' | 'OTHER'>('OTHER');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPhotos: File[] = [];
    const newPreviews: string[] = [];

    files.forEach((file) => {
      if (file.type.startsWith('image/')) {
        newPhotos.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === newPhotos.length) {
            setPhotoPreviews([...photoPreviews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      }
    });

    setPhotos([...photos, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (description.length < 10) {
      setError('La description doit contenir au moins 10 caractères');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload des photos d'abord (simulation - en production utiliser un service cloud)
      const photoUrls: string[] = [];
      for (const photo of photos) {
        // TODO: Upload réel vers S3/Cloudinary
        // Pour l'instant, on simule
        photoUrls.push(`/uploads/incidents/${Date.now()}-${photo.name}`);
      }

      const response = await fetch(`/api/bookings/${bookingId}/incident`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          description,
          photos: photoUrls.length > 0 ? photoUrls : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors du signalement');
      }

      // Réinitialiser le formulaire
      setType('OTHER');
      setDescription('');
      setPhotos([]);
      setPhotoPreviews([]);
      setOpen(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du signalement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Signaler un problème
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Signaler un problème</DialogTitle>
          <DialogDescription>
            Décrivez le problème rencontré lors de votre arrivée. Le support sera notifié immédiatement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type de problème */}
          <div>
            <Label htmlFor="incident-type">Type de problème *</Label>
            <select
              id="incident-type"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            >
              <option value="CODE_NOT_WORKING">Code inopérant</option>
              <option value="PLACE_DIFFERENT">Villa différente des photos</option>
              <option value="ACCESS_ISSUE">Problème d'accès</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="incident-description">Description détaillée *</Label>
            <Textarea
              id="incident-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème en détail..."
              minLength={10}
              maxLength={2000}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {description.length}/2000 caractères (minimum 10)
            </p>
          </div>

          {/* Photos */}
          <div>
            <Label>Photos (optionnel)</Label>
            <div className="mt-2 space-y-2">
              {photoPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {photoPreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <Image
                        src={preview}
                        alt={`Photo ${index + 1}`}
                        width={150}
                        height={150}
                        className="rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removePhoto(index)}
                        className="absolute top-1 right-1"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Ajouter des photos
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || description.length < 10}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                'Envoyer le signalement'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
