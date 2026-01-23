'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface DocumentUploadProps {
  onDocumentChange: (file: File | null) => void;
  error?: string;
  currentFileName?: string;
}

export function DocumentUpload({
  onDocumentChange,
  error,
  currentFileName,
}: DocumentUploadProps) {
  const [fileName, setFileName] = useState<string | null>(currentFileName || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      onDocumentChange(null);
      setFileName(null);
      return;
    }

    // Valider le format
    const validFormats = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];
    if (!validFormats.includes(file.type)) {
      alert('Format invalide. Veuillez sélectionner un fichier PDF, JPG ou PNG.');
      return;
    }

    // Valider la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximale: 10MB.');
      return;
    }

    setFileName(file.name);
    onDocumentChange(file);
  };

  const handleRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFileName(null);
    onDocumentChange(null);
  };

  return (
    <div className="space-y-2">
      <Label>Pièce d'identité</Label>
      <div className="flex items-center space-x-4">
        {fileName && (
          <div className="flex items-center space-x-2 rounded-lg border p-3 flex-1">
            <span className="text-sm">{fileName}</span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-destructive hover:text-destructive/90 text-sm"
              aria-label="Supprimer le document"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex flex-col space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,image/jpeg,image/png,image/jpg"
            onChange={handleFileChange}
            className="hidden"
            id="kyc-document"
            name="document"
            aria-label="Sélectionner un document d'identité (PDF, JPG ou PNG, max 10MB)"
            aria-describedby={error ? 'kyc-document-error' : undefined}
            aria-required="true"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            {fileName ? 'Changer le document' : 'Sélectionner un document'}
          </Button>
          <p className="text-xs text-muted-foreground">
            PDF, JPG ou PNG, max 10MB
          </p>
        </div>
      </div>
      {error && (
        <p id="kyc-document-error" className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
