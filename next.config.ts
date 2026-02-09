import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

// Bundle analyzer (uniquement si ANALYZE=true)
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: true,
  reloadOnOnline: false,
});

const nextConfig: NextConfig = {
  /* config options here */
  
  // Compression activée (par défaut dans Next.js mais explicite pour clarté)
  compress: true,
  
  // Optimisation des imports de packages volumineux
  // Réduit la taille des bundles en important uniquement ce qui est utilisé
  // Note: lucide-react est déjà optimisé par défaut, mais l'ajouter explicitement ne pose pas de problème
  experimental: {
    optimizePackageImports: [
      'lucide-react', // Déjà optimisé par défaut, mais explicite pour clarté
      '@radix-ui/react-checkbox',
      '@radix-ui/react-dialog',
      '@radix-ui/react-label',
      '@radix-ui/react-progress',
      '@radix-ui/react-select',
      '@radix-ui/react-slider',
      '@radix-ui/react-slot',
      '@radix-ui/react-tabs',
    ],
  },
  
  // Configuration optimisée des images
  // AVIF et WebP pour une meilleure compression et performance
  images: {
    // Formats modernes pour une meilleure compression (AVIF > WebP > JPEG/PNG)
    formats: ['image/avif', 'image/webp'],
    // Tailles d'images pour différents devices (responsive)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Tailles d'images pour les différentes densités d'écran
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Durée de cache minimale pour les images optimisées (en secondes)
    minimumCacheTTL: 60,
    // Domaines autorisés pour les images externes
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    // Next.js optimise automatiquement les images même en développement
    // Pas besoin de désactiver l'optimisation
  },
  
  // Force webpack pour Serwist (Turbopack pas encore supporté)
  // Compatible avec optimizePackageImports et les autres optimisations
  webpack: (config, { dev, isServer }) => {
    // Configuration des source maps pour le développement uniquement
    if (dev) {
      // En développement : générer des source maps de qualité pour faciliter le débogage
      // 'eval-source-map' est rapide et offre une bonne qualité pour le développement
      config.devtool = 'eval-source-map';
    } else {
      // En production : pas de source maps côté client (sécurité + taille)
      // Les source maps ne doivent jamais être exposés en production si le code contient des secrets
      config.devtool = false;
      
      // S'assurer que la minimisation est activée en production
      if (!isServer && config.optimization) {
        config.optimization.minimize = true;
      }
    }
    return config;
  },
  
  // Désactiver les source maps en production pour réduire la taille et protéger le code
  // ⚠️ IMPORTANT : Ne jamais exposer les source maps en production si le code contient des secrets
  // Les source maps permettent de voir le code source original, ce qui peut révéler des informations sensibles
  productionBrowserSourceMaps: false,
  
  // Source maps pour le développement/staging uniquement
  // En développement, Next.js génère automatiquement les source maps (déjà configuré dans webpack ci-dessus)
  
  // Configuration des compilateurs pour réduire les polyfills legacy
  // SWC est utilisé par défaut dans Next.js 16+ (plus rapide et moins de polyfills que Babel)
  compiler: {
    // Supprimer les console.log en production (garder error et warn)
    // Réduit légèrement la taille du bundle
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'], // Garder les erreurs et warnings en production
    } : false,
  },
  
  // Configuration Turbopack vide pour éviter l'erreur
  turbopack: {},
};

// Wrap with Serwist first, then Bundle Analyzer
// Sentry temporairement désactivé (cause 429) - réactiver en prod quand nécessaire
const configWithSerwist = withSerwist(nextConfig);
const configWithAnalyzer = withBundleAnalyzer(configWithSerwist);

export default configWithAnalyzer;
