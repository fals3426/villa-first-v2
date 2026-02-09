'use client';

import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle } from 'lucide-react';
import { MIN_LISTING_COMPLETENESS_SCORE } from '@/lib/constants';

interface ListingCompletenessIndicatorProps {
  score: number | null;
  showDetails?: boolean;
}

export function ListingCompletenessIndicator({
  score,
  showDetails = false,
}: ListingCompletenessIndicatorProps) {
  const currentScore = score ?? 0;
  const isComplete = currentScore >= MIN_LISTING_COMPLETENESS_SCORE;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Complétude de l'annonce</span>
          {isComplete ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-label="Complétude suffisante" />
          ) : (
            <XCircle className="h-4 w-4 text-amber-600" aria-label="Complétude insuffisante" />
          )}
        </div>
        <span className="text-sm font-semibold">{currentScore}%</span>
      </div>
      <Progress value={currentScore} className="h-2" />
      {showDetails && !isComplete && (
        <p className="text-xs text-muted-foreground">
          Score minimum requis : {MIN_LISTING_COMPLETENESS_SCORE}% pour publier l'annonce
        </p>
      )}
    </div>
  );
}
