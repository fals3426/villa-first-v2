'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useComparison } from '@/hooks/useComparison';
import { GitCompare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonBadgeProps {
  className?: string;
}

/**
 * Badge affichant le nombre d'annonces sélectionnées pour comparaison (Story 4.6)
 * Affiche un bouton "Comparer X annonces" qui mène à la vue de comparaison
 */
export function ComparisonBadge({ className }: ComparisonBadgeProps) {
  const router = useRouter();
  const { count, clearComparison, selectedIds } = useComparison();

  if (count === 0) {
    return null;
  }

  const handleCompare = () => {
    if (count >= 2) {
      const idsParam = selectedIds.join(',');
      router.push(`/listings/compare?ids=${idsParam}`);
    }
  };

  return (
    <div
      className={cn(
        'fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-lg border border-white/10 bg-zinc-900 p-3 shadow-lg backdrop-blur-sm max-w-[calc(100vw-2rem)]',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <GitCompare className="h-5 w-5 md:h-4 md:w-4 text-white" />
        <span className="text-sm font-medium text-white">
          {count} annonce{count > 1 ? 's' : ''} sélectionnée{count > 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="flex gap-2">
        {count >= 2 && (
          <Button variant="v1-primary" size="sm" onClick={handleCompare} className="flex-1 sm:flex-none">
            Comparer
          </Button>
        )}
        
        <Button
          variant="v1-ghost"
          size="sm"
          onClick={clearComparison}
          className="touch-target-min w-11 h-11 md:h-8 md:w-8 p-0"
          aria-label="Effacer la sélection"
        >
          <X className="h-5 w-5 md:h-4 md:w-4" />
        </Button>
      </div>
    </div>
  );
}
