'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { List, Map } from 'lucide-react';
import { cn } from '@/lib/utils';

type ViewType = 'list' | 'map';

interface ViewToggleProps {
  className?: string;
}

/**
 * Composant pour basculer entre la vue liste et la vue carte (Story 4.4)
 */
export function ViewToggle({ className }: ViewToggleProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentView = (searchParams.get('view') || 'list') as ViewType;

  const handleViewChange = (view: ViewType) => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === 'list') {
      params.delete('view');
    } else {
      params.set('view', view);
    }
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className={cn('flex gap-2 rounded-lg border p-1 bg-background', className)}>
      <Button
        variant={currentView === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleViewChange('list')}
        className={cn(
          'flex-1',
          currentView === 'list' && 'bg-primary text-primary-foreground'
        )}
      >
        <List className="h-4 w-4 mr-2" />
        Liste
      </Button>
      <Button
        variant={currentView === 'map' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleViewChange('map')}
        className={cn(
          'flex-1',
          currentView === 'map' && 'bg-primary text-primary-foreground'
        )}
      >
        <Map className="h-4 w-4 mr-2" />
        Carte
      </Button>
    </div>
  );
}
