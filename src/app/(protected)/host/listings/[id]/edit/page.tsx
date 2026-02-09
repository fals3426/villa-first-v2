'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { ListingForm } from '@/components/features/listings/ListingForm';
import { ListingVideoSection } from '@/components/features/listings/ListingVideoSection';
import { ListingRulesSection } from '@/components/features/listings/ListingRulesSection';
import { ListingPriceSection } from '@/components/features/listings/ListingPriceSection';
import { ValidationRulesSection } from '@/components/features/listings/ValidationRulesSection';
import { CheckInInstructionsEditor } from '@/components/features/checkin/CheckInInstructionsEditor';
import { ListingCompletenessIndicator } from '@/components/features/listings/ListingCompletenessIndicator';
import { ListingPublishButton } from '@/components/features/listings/ListingPublishButton';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Image as ImageIcon, Calendar } from 'lucide-react';
import type { CreateListingInput } from '@/types/listing.types';

// Lazy load ListingPhotosSection - composant lourd avec gestion upload photos
const ListingPhotosSection = dynamic(
  () => import('@/components/features/listings/ListingPhotosSection').then((mod) => ({ default: mod.ListingPhotosSection })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <ImageIcon className="h-12 w-12 text-muted-foreground animate-pulse" />
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Chargement de la galerie photos...</p>
          <p className="text-xs text-muted-foreground/70">Préparation de l'éditeur</p>
        </div>
      </div>
    ),
  }
);

// Lazy load ListingCalendarSection - composant lourd avec calendrier interactif
const ListingCalendarSection = dynamic(
  () => import('@/components/features/listings/ListingCalendarSection').then((mod) => ({ default: mod.ListingCalendarSection })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Calendar className="h-12 w-12 text-muted-foreground animate-pulse" />
        <div className="text-center space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Chargement du calendrier...</p>
          <p className="text-xs text-muted-foreground/70">Préparation de la disponibilité</p>
        </div>
      </div>
    ),
  }
);

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'video' | 'rules' | 'calendar' | 'price' | 'validation' | 'checkin'>('info');

  useEffect(() => {
    loadListing();

    // Écouter les événements de changement d'onglet depuis ListingPublishButton
    const handleTabChange = (event: CustomEvent<{ tab: string }>) => {
      setActiveTab(event.detail.tab as typeof activeTab);
    };
    window.addEventListener('listing-edit-tab-change', handleTabChange as EventListener);
    return () => {
      window.removeEventListener('listing-edit-tab-change', handleTabChange as EventListener);
    };
  }, [listingId]);

  const loadListing = async () => {
    try {
      const res = await fetch(`/api/listings/${listingId}`);
      if (!res.ok) throw new Error('Erreur lors du chargement de l\'annonce');
      const data = await res.json();
      setListing(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateListing = async (data: CreateListingInput) => {
    setError(null);

    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Erreur lors de la mise à jour');
      }

      await loadListing();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-black">
        <div className="container mx-auto max-w-4xl p-6">
          <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4">
            <p className="text-red-400">{error || 'Annonce introuvable'}</p>
            <Button
              variant="v1-outline"
              onClick={() => router.push('/host/listings')}
              className="mt-4"
            >
              Retour aux annonces
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto max-w-4xl p-6 space-y-8">
        <div className="space-y-4">
          <div>
            <p className="text-label mb-2">MODIFIER</p>
            <h1 className="text-heading-2 mb-2">Modifier l'annonce</h1>
            <p className="text-white/90">
              Gère les informations, photos et paramètres de ta coloc
            </p>
          </div>
          {listing && (
            <div className="rounded-lg border border-white/10 bg-zinc-900 p-4">
              <ListingCompletenessIndicator
                score={listing.completenessScore}
                showDetails={true}
              />
            </div>
          )}
        </div>

        {/* Onglets */}
        <div className="border-b border-white/10">
          <nav className="flex space-x-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('info')}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'info'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Informations
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'photos'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Photos
            </button>
            <button
              onClick={() => setActiveTab('video')}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'video'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Vidéo
            </button>
            <button
              onClick={() => setActiveTab('rules')}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Règles & Charte
            </button>
            <button
              onClick={() => setActiveTab('price')}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'price'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Prix
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Calendrier
            </button>
            <button
              onClick={() => setActiveTab('validation')}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'validation'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Validation
            </button>
            <button
              onClick={() => setActiveTab('checkin')}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === 'checkin'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-400 hover:text-white'
              }`}
            >
              Check-in
            </button>
          </nav>
        </div>

      {/* Contenu des onglets */}
      {activeTab === 'info' && (
        <div className="rounded-lg border p-6">
          <ListingForm
            initialData={{
              title: listing.title,
              description: listing.description,
              address: listing.address,
              location: listing.location || '',
              capacity: listing.capacity,
              listingType: listing.listingType,
            }}
            listingId={listingId}
            onSubmit={handleUpdateListing}
          />
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="rounded-lg border p-6">
          <ListingPhotosSection listingId={listingId} />
        </div>
      )}

      {activeTab === 'video' && (
        <div className="rounded-lg border p-6">
          <ListingVideoSection listingId={listingId} />
        </div>
      )}

      {activeTab === 'rules' && (
        <div className="rounded-lg border p-6">
          <ListingRulesSection listingId={listingId} />
        </div>
      )}

      {activeTab === 'price' && (
        <div className="rounded-lg border p-6">
          <ListingPriceSection listingId={listingId} />
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="rounded-lg border p-6">
          <ListingCalendarSection listingId={listingId} />
        </div>
      )}

      {activeTab === 'validation' && (
        <div className="rounded-lg border p-6">
          <ValidationRulesSection listingId={listingId} />
        </div>
      )}

      {activeTab === 'checkin' && (
        <div className="rounded-lg border p-6">
          <CheckInInstructionsEditor listingId={listingId} />
        </div>
      )}

      {/* Section Publication */}
      <div className="rounded-lg border p-6">
        <ListingPublishButton
          listingId={listingId}
          currentStatus={listing.status}
          completenessScore={listing.completenessScore}
          onPublished={loadListing}
        />
      </div>
      </div>
    </div>
  );
}
