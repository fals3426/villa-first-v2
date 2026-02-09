'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { MIN_LISTING_COMPLETENESS_SCORE } from '@/lib/constants';

interface ListingPublishButtonProps {
  listingId: string;
  currentStatus: string;
  completenessScore: number | null;
  onPublished?: () => void;
}

const MISSING_SECTIONS_LABELS: Record<string, string> = {
  basic_info_title: 'Compléter le titre (minimum 10 caractères)',
  basic_info_description: 'Compléter la description (minimum 50 caractères)',
  basic_info_address: 'Compléter l\'adresse',
  photos_cuisine: 'Ajouter au moins 1 photo de cuisine',
  photos_chambres: 'Ajouter au moins 1 photo de chambres',
  photos_salles_de_bain: 'Ajouter au moins 1 photo de salles de bain',
  photos_extérieurs: 'Ajouter au moins 1 photo d\'extérieurs',
  rules_charter: 'Définir les règles ou la charte de coloc',
  calendar: 'Ajouter des créneaux de disponibilité',
  price: 'Définir le prix par place',
};

const SECTION_TABS: Record<string, 'info' | 'photos' | 'rules' | 'calendar' | 'price'> = {
  basic_info_title: 'info',
  basic_info_description: 'info',
  basic_info_address: 'info',
  photos_cuisine: 'photos',
  photos_chambres: 'photos',
  photos_salles_de_bain: 'photos',
  photos_extérieurs: 'photos',
  rules_charter: 'rules',
  calendar: 'calendar',
  price: 'price',
};

export function ListingPublishButton({
  listingId,
  currentStatus,
  completenessScore,
  onPublished,
}: ListingPublishButtonProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<{
    code: string;
    message: string;
    details?: {
      currentScore: number;
      minScore: number;
      missingSections: string[];
    };
  } | null>(null);
  const [success, setSuccess] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/listings/${listingId}/publish`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.error?.code === 'COMPLETENESS_TOO_LOW') {
          setError(result.error);
        } else {
          setError({
            code: 'PUBLISH_ERROR',
            message: result.error?.message || 'Erreur lors de la publication',
          });
        }
        return;
      }

      setSuccess(true);
      if (onPublished) {
        onPublished();
      }
    } catch (err) {
      setError({
        code: 'NETWORK_ERROR',
        message: 'Erreur de connexion. Veuillez réessayer.',
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleNavigateToSection = (section: string) => {
    const tab = SECTION_TABS[section];
    if (tab) {
      // Émettre un événement personnalisé pour changer d'onglet
      window.dispatchEvent(new CustomEvent('listing-edit-tab-change', { detail: { tab } }));
    }
  };

  const isPublished = currentStatus === 'published';
  const canPublish = !isPublished && (completenessScore ?? 0) >= MIN_LISTING_COMPLETENESS_SCORE;

  if (isPublished) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 p-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span className="font-medium text-emerald-900 dark:text-emerald-100">
            Annonce publiée
          </span>
        </div>
        <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">
          Votre annonce est maintenant visible par les locataires.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <h3 className="font-semibold">Publication de l'annonce</h3>
          <p className="text-sm text-muted-foreground">
            {canPublish
              ? 'Votre annonce est prête à être publiée.'
              : `Score de complétude insuffisant (${completenessScore ?? 0}% / ${MIN_LISTING_COMPLETENESS_SCORE}% requis)`}
          </p>
        </div>
        <Button
          onClick={handlePublish}
          disabled={isPublishing || !canPublish}
          className="ml-4"
        >
          {isPublishing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Publication...
            </>
          ) : (
            'Publier l\'annonce'
          )}
        </Button>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span className="font-medium text-emerald-900 dark:text-emerald-100">
              Annonce publiée avec succès !
            </span>
          </div>
          <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-200">
            Votre annonce est maintenant visible par les locataires.
          </p>
        </div>
      )}

      {error && error.code === 'COMPLETENESS_TOO_LOW' && error.details && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-amber-900 dark:text-amber-100">
                Score de complétude insuffisant
              </h4>
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                {error.message}
              </p>
              {error.details.missingSections.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    Éléments à compléter :
                  </p>
                  <ul className="space-y-1">
                    {error.details.missingSections.map((section) => (
                      <li key={section} className="text-sm text-amber-800 dark:text-amber-200">
                        <button
                          type="button"
                          onClick={() => handleNavigateToSection(section)}
                          className="underline hover:text-amber-900 dark:hover:text-amber-100"
                        >
                          {MISSING_SECTIONS_LABELS[section] || section}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {error && error.code !== 'COMPLETENESS_TOO_LOW' && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h4 className="font-semibold text-destructive">Erreur</h4>
              <p className="mt-1 text-sm text-destructive">{error.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
