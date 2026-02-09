import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const response = NextResponse.next();
    
    // Configuration des en-têtes pour optimiser le bf-cache
    // Permettre le cache du document principal pour le bf-cache
    // Ne pas utiliser no-store qui bloque le bf-cache
    const pathname = req.nextUrl.pathname;
    
    // Pour les pages publiques et statiques, permettre le cache
    if (
      pathname === '/' ||
      pathname.startsWith('/listings') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/register')
    ) {
      // Utiliser public, max-age pour permettre le bf-cache
      // Ne pas utiliser no-store qui bloque le bf-cache
      response.headers.set(
        'Cache-Control',
        'public, max-age=0, must-revalidate'
      );
    }
    
    // Pour les pages protégées, utiliser une stratégie plus restrictive
    // mais toujours compatible avec bf-cache (pas de no-store)
    if (
      pathname.startsWith('/dashboard') ||
      pathname.startsWith('/host') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/profile')
    ) {
      // Utiliser private au lieu de no-store pour permettre le bf-cache
      response.headers.set(
        'Cache-Control',
        'private, max-age=0, must-revalidate'
      );
    }
    
    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/host/:path*',
    '/admin/:path*',
    '/profile/:path*',
  ],
};
