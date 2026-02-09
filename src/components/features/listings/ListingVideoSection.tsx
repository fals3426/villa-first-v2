'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, Loader2, Play } from 'lucide-react';

interface ListingVideoSectionProps {
  listingId: string;
}

export function ListingVideoSection({ listingId }: ListingVideoSectionProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadListing();
  }, [listingId]);

  const loadListing = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}`);
      if (!response.ok) throw new Error('Erreur lors du chargement de l\'annonce');
      const data = await response.json();
      setVideoUrl(data.data.videoUrl || null);
    } catch (err) {
      console.error('Error loading listing:', err);
      setError('Impossible de charger l\'annonce');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (file: File | null) => {
    if (!file) return;

    setError(null);
    setSuccess(null);
    setUploading(true);

    try {
      // Valider le format
      const validFormats = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
      if (!validFormats.includes(file.type)) {
        throw new Error('Format invalide. Veuillez sélectionner une vidéo MP4 ou MOV.');
      }

      // Valider la taille (max 100MB)
      if (file.size > 100 * 1024 * 1024) {
        throw new Error('La vidéo est trop volumineuse. Taille maximale: 100MB.');
      }

      // Upload via FormData
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch(`/api/listings/${listingId}/video`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(
          data.error === 'INVALID_FORMAT'
            ? 'Format invalide. MP4 ou MOV uniquement.'
            : data.error === 'FILE_TOO_LARGE'
            ? 'Fichier trop volumineux. Taille max: 100MB.'
            : 'Erreur lors de l\'upload de la vidéo'
        );
      }

      const result = await response.json();
      setVideoUrl(result.data.videoUrl);
      setSuccess('Vidéo uploadée avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      // Réinitialiser l'input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette vidéo ?')) return;

    try {
      const response = await fetch(`/api/listings/${listingId}/video`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      setVideoUrl(null);
      setSuccess('Vidéo supprimée avec succès');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
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
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold">Vidéo de présentation</Label>
        <p className="text-sm text-muted-foreground">
          Ajoutez une vidéo optionnelle pour présenter votre colocation (MP4 ou MOV, max 100MB)
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-emerald-50 dark:bg-emerald-900/20 p-3 text-sm text-emerald-700 dark:text-emerald-200" role="status">
          {success}
        </div>
      )}

      {videoUrl ? (
        <div className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
            <video
              src={videoUrl}
              controls
              className="h-full w-full object-contain"
              aria-label="Vidéo de présentation de la colocation"
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Remplacement...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Remplacer la vidéo
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={uploading}
            >
              <X className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex aspect-video items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50">
            <div className="text-center">
              <Play className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Aucune vidéo uploadée
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Upload en cours...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Ajouter une vidéo
              </>
            )}
          </Button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/quicktime"
        onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
        className="hidden"
        id="video-upload"
        aria-label="Ajouter une vidéo de présentation"
      />
    </div>
  );
}
