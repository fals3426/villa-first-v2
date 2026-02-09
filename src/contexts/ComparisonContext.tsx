'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

const STORAGE_KEY = 'listing-comparison';
const MAX_COMPARISONS = 5;

interface ComparisonContextType {
  selectedIds: string[];
  count: number;
  addToListing: (id: string) => void;
  removeFromListing: (id: string) => void;
  toggleListing: (id: string) => void;
  clearComparison: () => void;
  isSelected: (id: string) => boolean;
  canAddMore: boolean;
  maxComparisons: number;
}

const ComparisonContext = createContext<ComparisonContextType | null>(null);

interface ComparisonProviderProps {
  children: ReactNode;
  /** IDs initiaux (ex: depuis l'URL /listings/compare?ids=...) */
  initialIds?: string[];
}

export function ComparisonProvider({ children, initialIds }: ComparisonProviderProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds || []);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    if (initialIds && initialIds.length > 0) {
      setSelectedIds(initialIds);
      return;
    }
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored) as string[];
        setSelectedIds(ids);
      }
    } catch {
      // ignore
    }
  }, [mounted, initialIds?.join(',')]);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
    } catch {
      // ignore
    }
  }, [mounted, selectedIds]);

  const addToListing = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= MAX_COMPARISONS) return prev;
      return [...prev, id];
    });
  }, []);

  const removeFromListing = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const toggleListing = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_COMPARISONS) return prev;
      return [...prev, id];
    });
  }, []);

  const clearComparison = useCallback(() => {
    setSelectedIds([]);
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const value: ComparisonContextType = {
    selectedIds,
    count: selectedIds.length,
    addToListing,
    removeFromListing,
    toggleListing,
    clearComparison,
    isSelected,
    canAddMore: selectedIds.length < MAX_COMPARISONS,
    maxComparisons: MAX_COMPARISONS,
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const ctx = useContext(ComparisonContext);
  if (!ctx) {
    throw new Error('useComparison must be used within ComparisonProvider');
  }
  return ctx;
}
