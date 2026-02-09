'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validations/profile.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/features/profile/ImageUpload';
import { VibesQuestionnaire } from '@/components/features/onboarding/VibesQuestionnaire';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { VibesPreferences } from '@/types/vibes.types';
import Link from 'next/link';
import type { KycVerification } from '@/types/kyc.types';

interface Profile {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  profilePictureUrl?: string | null;
  userType: 'tenant' | 'host';
  vibesPreferences?: VibesPreferences | null;
  kycVerification?: KycVerification | null;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [vibesSuccess, setVibesSuccess] = useState(false);
  const [isSavingVibes, setIsSavingVibes] = useState(false);
  const [kycStatus, setKycStatus] = useState<KycVerification | null>(null);
  const [verifiedData, setVerifiedData] = useState<{
    name: string;
    dateOfBirth: Date | null;
    nationality: string | null;
    verifiedAt: Date | null;
    retentionUntil: Date | null;
  } | null>(null);
  const [isDeletingKyc, setIsDeletingKyc] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchKycStatus();
    fetchVerifiedData();
  }, []);

  const fetchKycStatus = async () => {
    try {
      const res = await fetch('/api/kyc/status');
      const result = await res.json();
      if (res.ok && result.data.status !== 'not_started') {
        setKycStatus(result.data);
      }
    } catch (error) {
      console.error('Error fetching KYC status:', error);
    }
  };

  const fetchVerifiedData = async () => {
    try {
      const res = await fetch('/api/kyc/verified-data');
      const result = await res.json();
      if (res.ok && result.data) {
        setVerifiedData({
          name: result.data.name,
          dateOfBirth: result.data.dateOfBirth ? new Date(result.data.dateOfBirth) : null,
          nationality: result.data.nationality,
          verifiedAt: result.data.verifiedAt ? new Date(result.data.verifiedAt) : null,
          retentionUntil: result.data.retentionUntil ? new Date(result.data.retentionUntil) : null,
        });
      }
    } catch (error) {
      console.error('Error fetching verified KYC data:', error);
    }
  };

  const handleDeleteKycData = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer vos données KYC ? Cette action est irréversible et vous devrez refaire la vérification pour accéder aux fonctionnalités nécessitant KYC.')) {
      return;
    }

    setIsDeletingKyc(true);
    try {
      const res = await fetch('/api/kyc/data', {
        method: 'DELETE',
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error?.message || 'Une erreur est survenue');
      }

      setKycStatus(null);
      setVerifiedData(null);
      alert('Vos données KYC ont été supprimées avec succès.');
    } catch (error) {
      console.error('Error deleting KYC data:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue');
    } finally {
      setIsDeletingKyc(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const result = await res.json();
      if (res.ok) {
        setProfile(result.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    setIsSaving(true);

    const formData = new FormData(e.currentTarget);
    const data: UpdateProfileInput = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      phone: formData.get('phone') as string,
    };

    // Validation
    const validation = updateProfileSchema.safeParse(data);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      setIsSaving(false);
      return;
    }

    // Créer FormData pour l'API
    const apiFormData = new FormData();
    if (validation.data.firstName) {
      apiFormData.append('firstName', validation.data.firstName);
    }
    if (validation.data.lastName) {
      apiFormData.append('lastName', validation.data.lastName);
    }
    if (validation.data.phone) {
      apiFormData.append('phone', validation.data.phone);
    }
    if (imageFile) {
      apiFormData.append('profilePicture', imageFile);
    }

    // Appel API
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        body: apiFormData,
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
        setIsSaving(false);
        return;
      }

      setProfile(result.data);
      setImageFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      setErrors({ general: 'Une erreur est survenue' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
            <p className="text-label mb-2">PROFIL</p>
            <h1 className="text-heading-2 mb-2">Mon profil</h1>
            <p className="text-white/90">
              Gère tes informations personnelles
            </p>
          </div>

          {success && (
            <Alert variant="default" className="bg-green-500/20 border-green-500/30">
              <AlertDescription className="text-green-300">
                Ton profil a été mis à jour avec succès.
              </AlertDescription>
            </Alert>
          )}

          <Card variant="v1-default">
            <CardHeader>
              <CardTitle className="text-white">Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <Alert variant="destructive">
                    <AlertDescription>{errors.general}</AlertDescription>
                  </Alert>
                )}

          <ImageUpload
            currentImageUrl={profile?.profilePictureUrl || null}
            onImageChange={setImageFile}
            error={errors.profilePicture}
          />

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={profile?.email || ''}
              disabled
              className="bg-muted"
            />
                <p className="text-xs text-zinc-500">
                  L'email ne peut pas être modifié
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Ton prénom"
                  defaultValue={profile?.firstName || ''}
                  aria-invalid={!!errors.firstName}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-400">{errors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Ton nom"
                  defaultValue={profile?.lastName || ''}
                  aria-invalid={!!errors.lastName}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-400">{errors.lastName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  defaultValue={profile?.phone || ''}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && (
                  <p className="text-sm text-red-400">{errors.phone}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <Button type="submit" variant="v1-primary" disabled={isSaving}>
                  {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </Button>
              </div>
              </form>
            </CardContent>
          </Card>

          {/* Section Préférences Vibes (uniquement pour les locataires) */}
          {profile?.userType === 'tenant' && (
            <Card variant="v1-default">
              <CardHeader>
                <CardTitle className="text-white">Préférences Vibes</CardTitle>
                <CardDescription className="text-zinc-400">
                  Modifie tes préférences pour trouver des colocs qui te correspondent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vibesSuccess && (
                  <Alert variant="default" className="bg-green-500/20 border-green-500/30 mb-6">
                    <AlertDescription className="text-green-300">
                      Tes préférences vibes ont été mises à jour avec succès.
                    </AlertDescription>
                  </Alert>
                )}

            <VibesQuestionnaire
              initialValues={profile.vibesPreferences || {}}
              onSubmit={async (preferences: VibesPreferences) => {
                setIsSavingVibes(true);
                setVibesSuccess(false);
                try {
                  const res = await fetch('/api/profile/vibes', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(preferences),
                  });

                  if (!res.ok) {
                    const result = await res.json();
                    throw new Error(result.error?.message || 'Une erreur est survenue');
                  }

                  const result = await res.json();
                  setProfile((prev) => ({
                    ...prev!,
                    vibesPreferences: result.data.vibesPreferences,
                  }));
                  setVibesSuccess(true);
                  setTimeout(() => setVibesSuccess(false), 3000);
                } catch (error) {
                  console.error('Error updating vibes:', error);
                  alert(error instanceof Error ? error.message : 'Une erreur est survenue');
                } finally {
                  setIsSavingVibes(false);
                }
                }}
                isEditing={true}
              />
              </CardContent>
            </Card>
          )}

          {/* Section KYC */}
          <Card variant="v1-default">
            <CardHeader>
              <CardTitle className="text-white">Vérification d'identité (KYC)</CardTitle>
              <CardDescription className="text-zinc-400">
                Vérifie ton identité pour accéder à toutes les fonctionnalités
              </CardDescription>
            </CardHeader>
            <CardContent>

          {kycStatus ? (
            <div className="space-y-4">
              <div>
                <p className="font-medium">Statut:</p>
                <p
                  className={
                    kycStatus.status === 'verified'
                      ? 'text-green-600 dark:text-green-400'
                      : kycStatus.status === 'pending'
                        ? 'text-yellow-600 dark:text-yellow-400'
                        : 'text-red-600 dark:text-red-400'
                  }
                >
                  {kycStatus.status === 'verified'
                    ? '✓ Vérifié'
                    : kycStatus.status === 'pending'
                      ? '⏳ En attente'
                      : '✗ Rejeté'}
                </p>
              </div>

                {/* Données vérifiées */}
                {kycStatus.status === 'verified' && verifiedData && (
                  <Card variant="v1-overlay" className="mb-4">
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Données vérifiées</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <p className="text-white/90">
                          <span className="font-medium text-white">Nom:</span> {verifiedData.name}
                        </p>
                        {verifiedData.dateOfBirth && (
                          <p className="text-white/90">
                            <span className="font-medium text-white">Date de naissance:</span>{' '}
                            {verifiedData.dateOfBirth.toLocaleDateString('fr-FR')}
                          </p>
                        )}
                        {verifiedData.nationality && (
                          <p className="text-white/90">
                            <span className="font-medium text-white">Nationalité:</span>{' '}
                            {verifiedData.nationality}
                          </p>
                        )}
                        {verifiedData.verifiedAt && (
                          <p className="text-xs text-zinc-500">
                            Vérifié le:{' '}
                            {verifiedData.verifiedAt.toLocaleDateString('fr-FR')}
                          </p>
                        )}
                        {verifiedData.retentionUntil && (
                          <p className="text-xs text-zinc-500">
                            Conservation jusqu'au:{' '}
                            {verifiedData.retentionUntil.toLocaleDateString('fr-FR')} (RGPD)
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {kycStatus.rejectionReason && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>
                      Raison du rejet: {kycStatus.rejectionReason}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-wrap gap-2">
                  {kycStatus.status === 'rejected' && (
                    <Link href="/kyc">
                      <Button variant="v1-outline">Soumettre un nouveau document</Button>
                    </Link>
                  )}
                  {kycStatus.status === 'verified' && (
                    <Button
                      variant="destructive"
                      onClick={handleDeleteKycData}
                      disabled={isDeletingKyc}
                    >
                      {isDeletingKyc
                        ? 'Suppression...'
                        : 'Supprimer mes données KYC (RGPD)'}
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-zinc-400">
                  Tu n'as pas encore soumis de document pour la vérification.
                </p>
                <Link href="/kyc">
                  <Button variant="v1-primary">Commencer la vérification</Button>
                </Link>
              </div>
            )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
