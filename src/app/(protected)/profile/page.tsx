'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { updateProfileSchema, type UpdateProfileInput } from '@/lib/validations/profile.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/features/profile/ImageUpload';
import { VibesQuestionnaire } from '@/components/features/onboarding/VibesQuestionnaire';
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
      <div className="container mx-auto p-6">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Mon profil</h1>
          <p className="text-muted-foreground mt-2">
            Gérez vos informations personnelles
          </p>
        </div>

        {success && (
          <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-200">
            Votre profil a été mis à jour avec succès.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {errors.general}
            </div>
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
            <p className="text-xs text-muted-foreground">
              L'email ne peut pas être modifié
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input
              id="firstName"
              name="firstName"
              type="text"
              placeholder="Votre prénom"
              defaultValue={profile?.firstName || ''}
              aria-invalid={!!errors.firstName}
            />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input
              id="lastName"
              name="lastName"
              type="text"
              placeholder="Votre nom"
              defaultValue={profile?.lastName || ''}
              aria-invalid={!!errors.lastName}
            />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName}</p>
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
              <p className="text-sm text-destructive">{errors.phone}</p>
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>

        {/* Section Préférences Vibes (uniquement pour les locataires) */}
        {profile?.userType === 'tenant' && (
          <div className="space-y-6 rounded-lg border p-6">
            <div>
              <h2 className="text-2xl font-bold">Préférences Vibes</h2>
              <p className="text-muted-foreground mt-2">
                Modifiez vos préférences pour trouver des colocations qui vous correspondent
              </p>
            </div>

            {vibesSuccess && (
              <div className="rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-800 dark:text-green-200">
                Vos préférences vibes ont été mises à jour avec succès.
              </div>
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
          </div>
        )}

        {/* Section KYC */}
        <div className="space-y-6 rounded-lg border p-6">
          <div>
            <h2 className="text-2xl font-bold">Vérification d'identité (KYC)</h2>
            <p className="text-muted-foreground mt-2">
              Vérifiez votre identité pour accéder à toutes les fonctionnalités
            </p>
          </div>

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
                <div className="space-y-3 rounded-lg border p-4 bg-muted/50">
                  <h3 className="font-semibold">Données vérifiées</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Nom:</span> {verifiedData.name}
                    </p>
                    {verifiedData.dateOfBirth && (
                      <p>
                        <span className="font-medium">Date de naissance:</span>{' '}
                        {verifiedData.dateOfBirth.toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    {verifiedData.nationality && (
                      <p>
                        <span className="font-medium">Nationalité:</span>{' '}
                        {verifiedData.nationality}
                      </p>
                    )}
                    {verifiedData.verifiedAt && (
                      <p className="text-xs text-muted-foreground">
                        Vérifié le:{' '}
                        {verifiedData.verifiedAt.toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    {verifiedData.retentionUntil && (
                      <p className="text-xs text-muted-foreground">
                        Conservation jusqu'au:{' '}
                        {verifiedData.retentionUntil.toLocaleDateString('fr-FR')} (RGPD)
                      </p>
                    )}
                  </div>
                </div>
              )}

              {kycStatus.rejectionReason && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  Raison du rejet: {kycStatus.rejectionReason}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {kycStatus.status === 'rejected' && (
                  <Link href="/kyc">
                    <Button variant="outline">Soumettre un nouveau document</Button>
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
              <p className="text-muted-foreground">
                Vous n'avez pas encore soumis de document pour la vérification.
              </p>
              <Link href="/kyc">
                <Button>Commencer la vérification</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
