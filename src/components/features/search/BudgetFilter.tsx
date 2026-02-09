'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Euro } from 'lucide-react';

interface BudgetFilterProps {
  min?: number;
  max?: number;
  defaultMin?: number;
  defaultMax?: number;
}

export function BudgetFilter({ min = 0, max = 5000, defaultMin = 0, defaultMax = 5000 }: BudgetFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [priceRange, setPriceRange] = useState<[number, number]>([
    defaultMin,
    defaultMax,
  ]);

  useEffect(() => {
    // Initialiser depuis les paramètres URL
    const urlMin = searchParams.get('minPrice');
    const urlMax = searchParams.get('maxPrice');
    
    if (urlMin || urlMax) {
      setPriceRange([
        urlMin ? parseFloat(urlMin) : defaultMin,
        urlMax ? parseFloat(urlMax) : defaultMax,
      ]);
    }
  }, [searchParams, defaultMin, defaultMax]);

  // Mémoriser callback updateUrl pour éviter re-création
  const updateUrl = useCallback((newRange: [number, number]) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newRange[0] > min) {
      params.set('minPrice', newRange[0].toString());
    } else {
      params.delete('minPrice');
    }
    
    if (newRange[1] < max) {
      params.set('maxPrice', newRange[1].toString());
    } else {
      params.delete('maxPrice');
    }
    
    params.set('page', '1'); // Reset à la page 1
    router.push(`/listings?${params.toString()}`);
  }, [searchParams, router, min, max]);

  // Mémoriser callback handleSliderChange
  const handleSliderChange = useCallback((values: number[]) => {
    const newRange: [number, number] = [values[0], values[1]];
    setPriceRange(newRange);
    updateUrl(newRange);
  }, [updateUrl]);

  // Mémoriser callback handleInputChange
  const handleInputChange = useCallback((index: 0 | 1, value: string) => {
    const numValue = parseFloat(value) || 0;
    setPriceRange((prevRange) => {
      const newRange: [number, number] = [...prevRange];
      newRange[index] = Math.max(min, Math.min(max, numValue));
      
      // S'assurer que min <= max
      if (index === 0 && newRange[0] > newRange[1]) {
        newRange[1] = newRange[0];
      } else if (index === 1 && newRange[1] < newRange[0]) {
        newRange[0] = newRange[1];
      }
      
      updateUrl(newRange);
      return newRange;
    });
  }, [min, max, updateUrl]);

  return (
    <div className="space-y-4">
      <div>
        <Label>Budget mensuel (€/mois)</Label>
        <p className="text-sm text-muted-foreground">
          Définissez votre fourchette de prix
        </p>
      </div>

      {/* Slider */}
      <div className="px-1 md:px-2 py-2">
        <Slider
          value={priceRange}
          onValueChange={handleSliderChange}
          min={min}
          max={max}
          step={50}
          className="w-full"
        />
      </div>

      {/* Inputs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="minPrice" className="text-xs">Minimum</Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 h-5 w-5 md:h-4 md:w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="minPrice"
              type="number"
              min={min}
              max={max}
              step="50"
              value={priceRange[0]}
              onChange={(e) => handleInputChange(0, e.target.value)}
              className="pl-11 md:pl-9"
            />
          </div>
        </div>
        <div className="pt-6 text-zinc-400 text-center sm:hidden">-</div>
        <div className="hidden sm:block pt-6 text-zinc-400">-</div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="maxPrice" className="text-xs">Maximum</Label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 h-5 w-5 md:h-4 md:w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              id="maxPrice"
              type="number"
              min={min}
              max={max}
              step="50"
              value={priceRange[1]}
              onChange={(e) => handleInputChange(1, e.target.value)}
              className="pl-11 md:pl-9"
            />
          </div>
        </div>
      </div>

      {/* Aperçu */}
      <div className="rounded-md bg-white/5 border border-white/10 p-3 md:p-2 text-center text-sm text-white">
        {priceRange[0].toLocaleString('fr-FR')}€ - {priceRange[1].toLocaleString('fr-FR')}€ / mois
      </div>
    </div>
  );
}
