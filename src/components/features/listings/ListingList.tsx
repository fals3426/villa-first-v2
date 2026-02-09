'use client';

import { memo } from 'react';
import { ListingCard } from './ListingCard';
import { Search } from 'lucide-react';

interface ListingListProps {
  listings: Array<any>;
  total?: number;
  isLoading?: boolean;
  activeVibes?: string[];
}

function ListingListComponent({ listings, total, isLoading, activeVibes = [] }: ListingListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-white mx-auto" />
          <p className="text-sm text-zinc-400">Chargement des annonces...</p>
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="h-12 w-12 text-zinc-400 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Aucune annonce trouvée</h3>
        <p className="text-sm text-zinc-400 max-w-md">
          Essayez de modifier tes critères de recherche ou explore toutes les annonces disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {total !== undefined && (
        <div className="text-sm text-zinc-400">
          {total} annonce{total > 1 ? 's' : ''} trouvée{total > 1 ? 's' : ''}
        </div>
      )}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {listings.map((listing) => (
          <ListingCard 
            key={listing.id} 
            listing={listing} 
            activeVibes={activeVibes as any}
          />
        ))}
      </div>
    </div>
  );
}

// Envelopper avec React.memo pour éviter re-renders inutiles
export const ListingList = memo(ListingListComponent);
ListingList.displayName = 'ListingList';
