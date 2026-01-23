import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: true,
  reloadOnOnline: false,
});

const nextConfig: NextConfig = {
  /* config options here */
  // Force webpack pour Serwist (Turbopack pas encore supporté)
  webpack: (config) => {
    return config;
  },
  // Configuration Turbopack vide pour éviter l'erreur
  turbopack: {},
};

export default withSerwist(nextConfig);
