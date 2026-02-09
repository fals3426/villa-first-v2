import { defaultCache } from '@serwist/next/worker';
import { Serwist } from 'serwist';
import type { PrecacheEntry } from 'serwist';
import { CacheableResponsePlugin } from 'serwist';
import { ExpirationPlugin } from 'serwist';
import { NetworkFirst, CacheFirst } from 'serwist';

declare const self: {
  __SW_MANIFEST: (string | PrecacheEntry)[];
};

// Configuration du cache pour les réservations (Story 5.10)
const runtimeCaching = [
  // Cache des réservations confirmées - Network First avec fallback cache
  {
    matcher: ({ url }: { url: URL }) => {
      return url.pathname.startsWith('/api/bookings') && url.searchParams.get('status') === 'confirmed';
    },
    handler: new NetworkFirst({
      cacheName: 'bookings-confirmed-cache',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [200],
        }),
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours
        }),
      ],
    }),
  },
  // Cache général des réservations - Network First
  {
    matcher: ({ url }: { url: URL }) => url.pathname.startsWith('/api/bookings'),
    handler: new NetworkFirst({
      cacheName: 'bookings-cache',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [200],
        }),
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 24 * 60 * 60, // 24 heures
        }),
      ],
    }),
  },
  // Cache des pages de réservations - Cache First
  {
    matcher: ({ url }: { url: URL }) => url.pathname === '/bookings',
    handler: new CacheFirst({
      cacheName: 'bookings-page-cache',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [200],
        }),
        new ExpirationPlugin({
          maxAgeSeconds: 60 * 60, // 1 heure
        }),
      ],
    }),
  },
  // Cache pour les instructions de check-in (Story 8.4)
  {
    matcher: ({ url }: { url: URL }) => url.pathname.includes('/checkin-instructions'),
    handler: new CacheFirst({
      cacheName: 'checkin-instructions-cache',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 7 * 24 * 60 * 60 }),
      ],
    }),
  },
];

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
});

serwist.addEventListeners();
