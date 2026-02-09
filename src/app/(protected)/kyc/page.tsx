'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DocumentUpload } from '@/components/features/kyc/DocumentUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'rejected':
        return 'text-red-400';
      default:
        return 'text-zinc-400';
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto p-6 max-w-2xl">
        <div className="space-y-8">
          <div>
            <p className="text-label mb-2">VÉRIFICATION</p>
            <h1 className="text-heading-2 mb-2">Vérification d'identité (KYC)</h1>
            <p className="text-white/90">
              Télécharge une pièce d'identité valide pour vérifier ton identité
            </p>
          </div>

          {/* Statut actuel */}
          {kycStatus && (
            <Card variant="v1-default">
              <CardHeader>
                <CardTitle className="text-white">Statut de vérification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-white/90">
                    <span className="font-medium text-white">Statut:</span>{' '}
                    <span className={getStatusColor(kycStatus.status)}>
                      {getStatusLabel(kycStatus.status)}
                    </span>
                  </p>
                  {kycStatus.verifiedAt && (
                    <p className="text-sm text-zinc-400">
                      Vérifié le:{' '}
                      {new Date(kycStatus.verifiedAt).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                  {kycStatus.rejectedAt && (
                    <div className="space-y-1">
                      <p className="text-sm text-zinc-400">
                        Rejeté le:{' '}
                        {new Date(kycStatus.rejectedAt).toLocaleDateString('fr-FR')}
                      </p>
                      {kycStatus.rejectionReason && (
                        <p className="text-sm text-red-400">
                          Raison: {kycStatus.rejectionReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {success && (
            <Alert variant="default" className="bg-green-500/20 border-green-500/30">
              <AlertDescription className="text-green-300">
                Ton document a été soumis avec succès. La vérification est en cours.
              </AlertDescription>
            </Alert>
          )}

          {/* Formulaire d'upload */}
          {(!kycStatus || kycStatus.status === 'rejected') && (
            <Card variant="v1-default">
              <CardHeader>
                <CardTitle className="text-white">Soumettre un document</CardTitle>
                <CardDescription className="text-zinc-400">
                  Télécharge une pièce d'identité valide
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {errors.general && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.general}</AlertDescription>
                    </Alert>
                  )}

                  <DocumentUpload
                    onDocumentChange={setDocumentFile}
                    error={errors.document}
                  />

                  <Card variant="v1-overlay" className="p-4">
                    <h3 className="font-semibold text-white mb-2">Documents acceptés</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
                      <li>Passeport</li>
                      <li>Carte d'identité</li>
                      <li>Permis de conduire</li>
                    </ul>
                    <p className="mt-2 text-xs text-zinc-500">
                      Le document doit être clair, lisible et à jour. Les copies
                      scannées ou photos de bonne qualité sont acceptées.
                    </p>
                  </Card>

                  <div className="flex justify-end">
                    <Button type="submit" variant="v1-primary" disabled={isSubmitting || !documentFile}>
                      {isSubmitting ? 'Soumission...' : 'Soumettre pour vérification'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {kycStatus?.status === 'pending' && (
            <Alert variant="default" className="bg-yellow-500/20 border-yellow-500/30">
              <AlertDescription className="text-yellow-300">
                Ta vérification est en cours. Tu recevras une notification
                une fois la vérification terminée.
              </AlertDescription>
            </Alert>
          )}

          {kycStatus?.status === 'verified' && (
            <Alert variant="default" className="bg-green-500/20 border-green-500/30">
              <AlertDescription className="text-green-300">
                ✓ Ton identité a été vérifiée avec succès.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
