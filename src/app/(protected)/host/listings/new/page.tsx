'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ListingForm } from '@/components/features/listings/ListingForm';
import type { CreateListingInput } from '@/types/listing.types';

export default function NewListingPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateListingInput) => {
    setError(null);

    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.error?.message) {
          setError(result.error.message);
          throw new Error(result.error.message);
        } else {
          throw new Error('Une erreur est survenue lors de la création');
        }
      }

      // Rediriger vers la page d'édition de l'annonce
      router.push(`/host/listings/${result.data.id}/edit`);
    } catch (err) {
      if (err instanceof Error && err.message !== error) {
        setError(err.message);
      }
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto max-w-3xl p-6 space-y-8">
        <div>
          <p className="text-label mb-2">CRÉER UNE ANNONCE</p>
          <h1 className="text-heading-2 mb-2">Créer une nouvelle annonce</h1>
          <p className="text-white/90">
            Remplis les informations de base de ta coloc. Tu pourras ajouter des photos,
            définir les règles et publier ensuite.
          </p>
        </div>

        <div className="rounded-lg border border-white/10 bg-zinc-900 p-6">
          <ListingForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
