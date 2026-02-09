'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Photo {
  id: string;
  url: string;
  category?: string;
}

interface ListingPhotoSwiperProps {
  photos: Photo[];
  title: string;
  className?: string;
}

export function ListingPhotoSwiper({ photos, title, className }: ListingPhotoSwiperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateIndex = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const width = el.offsetWidth;
    const index = Math.round(scrollLeft / width);
    setCurrentIndex(Math.min(index, photos.length - 1));
  }, [photos.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateIndex, { passive: true });
    return () => el.removeEventListener('scroll', updateIndex);
  }, [updateIndex]);

  const goTo = (index: number) => {
    const el = containerRef.current;
    if (!el) return;
    const width = el.offsetWidth;
    el.scrollTo({ left: index * width, behavior: 'smooth' });
    setCurrentIndex(index);
  };

  if (!photos.length) {
    return (
      <div
        className={cn(
          'relative aspect-video w-full overflow-hidden rounded-3xl bg-zinc-800 flex items-center justify-center text-zinc-500',
          className
        )}
      >
        Aucune photo
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div
        ref={containerRef}
        className="flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth rounded-3xl bg-zinc-800 aspect-video w-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: 'touch' }}
        role="region"
        aria-label="Galerie photos du logement"
      >
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative shrink-0 w-full aspect-video snap-start snap-always"
          >
            <Image
              src={photo.url}
              alt={`${title} - ${photo.category || `Photo ${index + 1}`}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
              priority={index === 0}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {/* Indicateurs (points) */}
      {photos.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
          {photos.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              className={cn(
                'h-2 rounded-full transition-all duration-200',
                index === currentIndex
                  ? 'w-6 bg-white'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              )}
              aria-label={`Photo ${index + 1} sur ${photos.length}`}
            />
          ))}
        </div>
      )}

      {/* Flèches (desktop) */}
      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(Math.max(0, currentIndex - 1))}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            aria-label="Photo précédente"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => goTo(Math.min(photos.length - 1, currentIndex + 1))}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
            aria-label="Photo suivante"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Compteur (optionnel) */}
      {photos.length > 1 && (
        <div className="absolute right-3 top-3 z-10 rounded-full bg-black/50 px-2 py-1 text-xs text-white/90">
          {currentIndex + 1} / {photos.length}
        </div>
      )}
    </div>
  );
}
