'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DocumentUpload } from '@/components/features/kyc/DocumentUpload';
import { Button } from '@/components/ui/button';
import type { KycVerification } from '@/types/kyc.types';

export default function KycPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [kycStatus, setKycStatus] = useState<KycVerification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    fetchKycStatus();
    
    // Vérifier si KYC est requis (depuis query param)
    const params = new URLSearchParams(window.location.search);
    if (params.get('required') === 'true') {
      // Afficher un message indiquant que KYC est requis
    }
  }, [status]);

  const fetchKycStatus = async () => {
    try {
      const res = await fetch('/api/kyc/status');
      const result = await res.json();
      if (res.ok) {
        if (result.data.status !== 'not_started') {
          setKycStatus(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);

    if (!documentFile) {
      setErrors({ document: 'Veuillez sélectionner un document' });
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('document', documentFile);

    try {
      const res = await fetch('/api/kyc/verify', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.error?.code === 'VALIDATION_ERROR') {
          const fieldErrors: Record<string, string> = {};
          result.error.details?.forEach(
            (err: { path: string[]; message: string }) => {
              if (err.path[0]) {
                fieldErrors[err.path[0].toString()] = err.message;
              }
            }
          );
          setErrors(fieldErrors);
        } else {
          setErrors({ general: result.error?.message || 'Une erreur est survenue' });
        }
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);
      setDocumentFile(null);
      await fetchKycStatus();
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setErrors({ general: 'Une erreur est survenue' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Vérifié';
      case 'pending':
        return 'En attente';
      case 'rejected':
        return 'Rejeté';
      default:
        return 'Non commencé';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 dark:text-green-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'rejected':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="container mx-auto p-6">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Vérification d'identité (KYC)</h1>
          <p className="text-muted-foreground mt-2">
            Téléchargez une pièce d'identité valide pour vérifier votre identité
          </p>
        </div>

        {/* Statut actuel */}
        {kycStatus && (
          <div className="rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Statut de vérification</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Statut:</span>{' '}
                <span className={getStatusColor(kycStatus.status)}>
                  {getStatusLabel(kycStatus.status)}
                </span>
              </p>
              {kycStatus.verifiedAt && (
                <p className="text-sm text-muted-foreground">
                  Vérifié le:{' '}
                  {new Date(kycStatus.verifiedAt).toLocaleDateString('fr-FR')}
                </p>
              )}
              {kycStatus.rejectedAt && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Rejeté le:{' '}
                    {new Date(kycStatus.rejectedAt).toLocaleDateString('fr-FR')}
                  </p>
                  {kycStatus.rejectionReason && (
                    <p className="text-sm text-destructive">
                      Raison: {kycStatus.rejectionReason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-200">
            Votre document a été soumis avec succès. La vérification est en cours.
          </div>
        )}

        {/* Formulaire d'upload */}
        {(!kycStatus || kycStatus.status === 'rejected') && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {errors.general}
              </div>
            )}

            <DocumentUpload
              onDocumentChange={setDocumentFile}
              error={errors.document}
            />

            <div className="rounded-lg border p-4 bg-muted/50">
              <h3 className="font-semibold mb-2">Documents acceptés</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Passeport</li>
                <li>Carte d'identité</li>
                <li>Permis de conduire</li>
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                Le document doit être clair, lisible et à jour. Les copies
                scannées ou photos de bonne qualité sont acceptées.
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting || !documentFile}>
                {isSubmitting ? 'Soumission...' : 'Soumettre pour vérification'}
              </Button>
            </div>
          </form>
        )}

        {kycStatus?.status === 'pending' && (
          <div className="rounded-lg border p-6 bg-yellow-50 dark:bg-yellow-900/20">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Votre vérification est en cours. Vous recevrez une notification
              une fois la vérification terminée.
            </p>
          </div>
        )}

        {kycStatus?.status === 'verified' && (
          <div className="rounded-lg border p-6 bg-green-50 dark:bg-green-900/20">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Votre identité a été vérifiée avec succès.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
