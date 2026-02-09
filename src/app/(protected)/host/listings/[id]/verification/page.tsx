'use client';

import { useParams } from 'next/navigation';

import { VerificationUploadForm } from '@/components/features/verification/VerificationUploadForm';

export default function ListingVerificationPage() {
  const params = useParams();
  const listingId = params?.id as string | undefined;

  if (!listingId) {
    return (
      <div className="p-6">
        <p className="text-sm text-destructive">
          Annonce introuvable. Veuillez réessayer depuis votre tableau de bord hôte.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Vérification de l&apos;annonce</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Uploadez vos documents de titre de propriété ou mandat pour demander la
          vérification de cette annonce. Une fois approuvée, elle pourra afficher le badge
          &quot;Annonce vérifiée&quot;.
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <VerificationUploadForm listingId={listingId} />
      </div>
    </div>
  );
}

