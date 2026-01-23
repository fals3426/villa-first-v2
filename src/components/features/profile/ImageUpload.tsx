'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onImageChange: (file: File | null) => void;
  error?: string;
}

export function ImageUpload({
  currentImageUrl,
  onImageChange,
  error,
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      onImageChange(null);
      setPreview(currentImageUrl || null);
      return;
    }

    // Valider le format
    const validFormats = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validFormats.includes(file.type)) {
      alert('Format invalide. Veuillez sélectionner une image JPG ou PNG.');
      return;
    }

    // Valider la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('L\'image est trop grande. Taille maximale: 5MB.');
      return;
    }

    // Créer preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageChange(file);
    setIsUploading(false);
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setPreview(null);
    onImageChange(null);
  };

  return (
    <div className="space-y-2">
      <Label>Photo de profil</Label>
      <div className="flex items-center space-x-4">
        {preview && (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="h-24 w-24 rounded-full object-cover border-2"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 rounded-full bg-destructive text-destructive-foreground p-1 text-xs hover:bg-destructive/90"
              aria-label="Supprimer la photo de profil"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex flex-col space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            className="hidden"
            id="profilePicture"
            name="profilePicture"
            aria-label="Sélectionner une photo de profil"
            aria-describedby={error ? 'profile-picture-error' : undefined}
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {preview ? 'Changer la photo' : 'Ajouter une photo'}
          </Button>
          <p className="text-xs text-muted-foreground">
            JPG ou PNG, max 5MB
          </p>
        </div>
      </div>
      {error && (
        <p id="profile-picture-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
