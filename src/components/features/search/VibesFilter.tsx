'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { VibeTag, type VibeType } from '@/components/features/vibes/VibeTag';
import { Checkbox } from '@/components/ui/checkbox';

interface VibesFilterProps {
  availableVibes?: VibeType[];
}

const ALL_VIBES: VibeType[] = ['calm', 'social', 'spiritual', 'remote'];

export function VibesFilter({ availableVibes = ALL_VIBES }: VibesFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedVibes, setSelectedVibes] = useState<VibeType[]>([]);

  useEffect(() => {
    // Initialiser depuis les paramètres URL
    const urlVibes = searchParams.get('vibes');
    if (urlVibes) {
      const vibesArray = urlVibes.split(',').filter(Boolean) as VibeType[];
      setSelectedVibes(vibesArray.filter((v) => ALL_VIBES.includes(v)));
    }
  }, [searchParams]);

  // Mémoriser callback updateUrl
  const updateUrl = useCallback((vibes: VibeType[]) => {
    const params = new URLSearchParams(searchParams.toString());

    if (vibes.length > 0) {
      params.set('vibes', vibes.join(','));
    } else {
      params.delete('vibes');
    }

    params.set('page', '1'); // Reset à la page 1
    router.push(`/listings?${params.toString()}`);
  }, [searchParams, router]);

  // Mémoriser callback toggleVibe
  const toggleVibe = useCallback((vibe: VibeType) => {
    setSelectedVibes((prevSelected) => {
      const newSelected = prevSelected.includes(vibe)
        ? prevSelected.filter((v) => v !== vibe)
        : [...prevSelected, vibe];
      updateUrl(newSelected);
      return newSelected;
    });
  }, [updateUrl]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Vibes (style de vie)</Label>
        <p className="text-sm text-muted-foreground">
          Sélectionnez les ambiances qui vous correspondent
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {availableVibes.map((vibe) => {
          const isSelected = selectedVibes.includes(vibe);
          return (
            <div 
              key={vibe} 
              className="flex items-center gap-3 touch-target-min cursor-pointer"
              onClick={() => toggleVibe(vibe)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleVibe(vibe);
                }
              }}
            >
              <Checkbox
                id={`vibe-${vibe}`}
                checked={isSelected}
                onCheckedChange={() => toggleVibe(vibe)}
                aria-label={`Sélectionner ${vibe}`}
                className="pointer-events-none"
              />
              <label
                htmlFor={`vibe-${vibe}`}
                className="cursor-pointer flex-1"
              >
                <VibeTag
                  vibe={vibe}
                  variant="standard"
                  selected={isSelected}
                  onClick={() => toggleVibe(vibe)}
                />
              </label>
            </div>
          );
        })}
      </div>

      {selectedVibes.length > 0 && (
        <div className="text-xs text-zinc-400">
          {selectedVibes.length} vibe{selectedVibes.length > 1 ? 's' : ''} sélectionnée{selectedVibes.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}
