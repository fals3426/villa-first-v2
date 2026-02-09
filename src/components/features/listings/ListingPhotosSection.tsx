'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PhotoCategory } from '@prisma/client';
import { X, Upload, ArrowUp, ArrowDown, Loader2 } from 'lucide-react';

interface ListingPhoto {
  id: string;
  category: PhotoCategory;
  url: string;
  position: number;
}

interface ListingPhotosSectionProps {
  listingId: string;
}

const CATEGORY_LABELS: Record<PhotoCategory, string> = {
  KITCHEN: 'Cuisine',
  BEDROOM: 'Chambres',
  BATHROOM: 'Salles de bain',
  OUTDOOR: 'Extérieurs',
  OTHER: 'Autres',
};

const CATEGORY_DESCRIPTIONS: Record<PhotoCategory, string> = {
  KITCHEN: 'Photos de la cuisine et des espaces de préparation',
  BEDROOM: 'Photos des chambres disponibles',
  BATHROOM: 'Photos des salles de bain',
  OUTDOOR: 'Photos des espaces extérieurs (jardin, terrasse, piscine)',
  OTHER: 'Autres photos de la colocation',
};

export function ListingPhotosSection({ listingId }: ListingPhotosSectionProps) {
  const [photos, setPhotos] = useState<Record<PhotoCategory, ListingPhoto[]>>({
    KITCHEN: [],
    BEDROOM: [],
    BATHROOM: [],
    OUTDOOR: [],
    OTHER: [],
  });
  const [uploading, setUploading] = useState<Record<PhotoCategory, boolean>>({
    KITCHEN: false,
    BEDROOM: false,
    BATHROOM: false,
    OUTDOOR: false,
    OTHER: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRefs = useRef<Record<PhotoCategory, HTMLInputElement | null>>({
    KITCHEN: null,
    BEDROOM: null,
    BATHROOM: null,
    OUTDOOR: null,
    OTHER: null,
  });

  // Charger les photos existantes
  useEffect(() => {
    loadPhotos();
  }, [listingId]);

  const loadPhotos = async () => {
    try {
      const response = await fetch(`/api/listings/${listingId}/photos`);
      if (!response.ok) throw new Error('Erreur lors du chargement des photos');
      const data = await response.json();
      setPhotos(data.photos);
    } catch (err) {
      console.error('Error loading photos:', err);
      setError('Impossible de charger les photos');
    }
  };

  const handleFileSelect = async (category: PhotoCategory, files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);
    setSuccess(null);
    setUploading((prev) => ({ ...prev, [category]: true }));

    try {
      // Valider les fichiers
      const validFormats = ['image/jpeg', 'image/png', 'image/jpg'];
      const fileArray = Array.from(files);
      
      for (const file of fileArray) {
        if (!validFormats.includes(file.type)) {
          throw new Error('Format invalide. Veuillez sélectionner des images JPG ou PNG.');
        }
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('Une image est trop volumineuse. Taille maximale: 10MB.');
        }
      }

      // Upload via FormData
      const formData = new FormData();
      formData.append('category', category);
      fileArray.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/listings/${listingId}/photos`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error === 'INVALID_FORMAT' 
          ? 'Format invalide. JPG ou PNG uniquement.'
          : data.error === 'FILE_TOO_LARGE'
          ? 'Fichier trop volumineux. Taille max: 10MB.'
          : 'Erreur lors de l\'upload des photos');
      }

      setSuccess(`${fileArray.length} photo(s) ajoutée(s) avec succès`);
      await loadPhotos(); // Recharger les photos
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
    } finally {
      setUploading((prev) => ({ ...prev, [category]: false }));
      // Réinitialiser l'input
      const input = fileInputRefs.current[category];
      if (input) input.value = '';
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette photo ?')) return;

    try {
      const response = await fetch(`/api/listings/${listingId}/photos/${photoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      setSuccess('Photo supprimée avec succès');
      await loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
    }
  };

  const handleReorder = async (category: PhotoCategory, photoId: string, direction: 'up' | 'down') => {
    const categoryPhotos = [...photos[category]];
    const index = categoryPhotos.findIndex((p) => p.id === photoId);
    if (index === -1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categoryPhotos.length) return;

    // Échanger les positions
    [categoryPhotos[index], categoryPhotos[newIndex]] = [
      categoryPhotos[newIndex],
      categoryPhotos[index],
    ];

    // Mettre à jour localement
    setPhotos((prev) => ({ ...prev, [category]: categoryPhotos }));

    // Envoyer au serveur
    try {
      const updates = categoryPhotos.map((photo, idx) => ({
        photoId: photo.id,
        position: idx,
      }));

      const response = await fetch(`/api/listings/${listingId}/photos/reorder`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        // Recharger en cas d'erreur
        await loadPhotos();
        throw new Error('Erreur lors de la réorganisation');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la réorganisation');
      await loadPhotos(); // Restaurer l'état précédent
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Photos de l'annonce</h2>
        <p className="text-muted-foreground">
          Ajoutez des photos par catégorie pour présenter votre colocation
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

      {Object.values(PhotoCategory).map((category) => (
        <div key={category} className="space-y-3 rounded-lg border p-4">
          <div>
            <Label className="text-base font-semibold">{CATEGORY_LABELS[category]}</Label>
            <p className="text-sm text-muted-foreground">{CATEGORY_DESCRIPTIONS[category]}</p>
          </div>

          {/* Photos existantes */}
          {photos[category].length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {photos[category].map((photo, index) => (
                <div key={photo.id} className="group relative aspect-video overflow-hidden rounded-lg border">
                  <img
                    src={photo.url}
                    alt={`${CATEGORY_LABELS[category]} - Photo ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={() => handleReorder(category, photo.id, 'up')}
                      disabled={index === 0}
                      aria-label="Déplacer vers le haut"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={() => handleReorder(category, photo.id, 'down')}
                      disabled={index === photos[category].length - 1}
                      aria-label="Déplacer vers le bas"
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(photo.id)}
                      aria-label="Supprimer la photo"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Zone d'upload */}
          <div>
            <input
              ref={(el) => {
                fileInputRefs.current[category] = el;
              }}
              type="file"
              accept="image/jpeg,image/png,image/jpg"
              multiple
              onChange={(e) => handleFileSelect(category, e.target.files)}
              className="hidden"
              id={`photo-upload-${category}`}
              aria-label={`Ajouter des photos pour ${CATEGORY_LABELS[category]}`}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRefs.current[category]?.click()}
              disabled={uploading[category]}
              className="w-full"
            >
              {uploading[category] ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Upload en cours...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Ajouter des photos
                </>
              )}
            </Button>
            <p className="mt-1 text-xs text-muted-foreground">
              JPG ou PNG, max 10MB par photo. Vous pouvez sélectionner plusieurs photos.
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
