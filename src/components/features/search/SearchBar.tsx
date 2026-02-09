'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  placeholder?: string;
}

export function SearchBar({ placeholder = 'Rechercher par localisation (ex: Canggu, Ubud...)' }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('location') || '');

  useEffect(() => {
    // Synchroniser avec les paramètres URL
    setQuery(searchParams.get('location') || '');
  }, [searchParams]);

  // Mémoriser callback handleSearch
  const handleSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) {
      params.set('location', query.trim());
      params.set('page', '1'); // Reset à la page 1
    } else {
      params.delete('location');
    }

    router.push(`/listings?${params.toString()}`);
  }, [query, searchParams, router]);

  // Mémoriser callback handleKeyPress
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400 md:h-4 md:w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-11 md:pl-9"
          aria-label="Rechercher des colocations par localisation"
        />
      </div>
      <Button onClick={handleSearch} type="button" className="w-full sm:w-auto">
        Rechercher
      </Button>
    </div>
  );
}
