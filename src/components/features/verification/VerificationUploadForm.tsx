'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface VerificationUploadFormProps {
  listingId: string;
}

type LocalDocument = {
  file: File;
  id: string;
};

export function VerificationUploadForm({ listingId }: VerificationUploadFormProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<LocalDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setSuccess(null);

    const files = Array.from(e.target.files || []);
    if (!files.length) {
      setDocuments([]);
      return;
    }

    const validMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
    ];

    const nextDocs: LocalDocument[] = [];

    for (const file of files) {
      if (!validMimeTypes.includes(file.type)) {
        setError('Format invalide. PDF, JPG ou PNG uniquement.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Le fichier est trop volumineux. Taille maximale: 10MB.');
        return;
      }
      nextDocs.push({
        file,
        id: `${file.name}-${file.size}-${file.lastModified}`,
      });
    }

    setDocuments(nextDocs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!documents.length) {
      setError('Veuillez sélectionner au moins un document.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Pour l’instant, nous n’avons pas encore de stockage externe (S3/Cloudinary)
      // On envoie donc seulement les métadonnées simulées.
      const body = {
        listingId,
        documents: documents.map((doc) => ({
          storageUrl: `/placeholder/${encodeURIComponent(doc.file.name)}`,
          fileType: doc.file.type,
          fileSize: doc.file.size,
          originalFileName: doc.file.name,
        })),
      };

      const res = await fetch('/api/verifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.error?.message) {
          setError(result.error.message);
        } else {
          setError('Une erreur est survenue lors de la création de la demande.');
        }
        setIsSubmitting(false);
        return;
      }

      setSuccess('Votre demande de vérification a été envoyée au support.');
      setDocuments([]);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Une erreur est survenue lors de la création de la demande.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="space-y-2">
        <Label htmlFor="documents">
          Documents de titre de propriété ou mandat
        </Label>
        <Input
          id="documents"
          type="file"
          multiple
          accept="application/pdf,image/jpeg,image/png,image/jpg"
          onChange={handleFilesChange}
          aria-describedby="documents-help"
        />
        <p id="documents-help" className="text-xs text-muted-foreground">
          Formats acceptés : PDF, JPG, PNG. Taille max : 10MB par fichier.
        </p>
      </div>

      {documents.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Fichiers sélectionnés</p>
          <ul className="space-y-1 text-sm">
            {documents.map((doc) => (
              <li key={doc.id} className="flex items-center justify-between rounded border px-3 py-1">
                <span className="truncate max-w-xs">{doc.file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(doc.file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting || documents.length === 0}>
        {isSubmitting ? 'Envoi en cours...' : 'Soumettre pour vérification'}
      </Button>
    </form>
  );
}

