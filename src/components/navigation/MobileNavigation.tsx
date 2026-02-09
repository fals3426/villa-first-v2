'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Home, 
  Search, 
  Calendar, 
  User, 
  Building2,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';

const tenantNavItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Rechercher',
    href: '/listings',
    icon: Search,
  },
  {
    name: 'Mes réservations',
    href: '/bookings',
    icon: Calendar,
  },
  {
    name: 'Profil',
    href: '/profile',
    icon: User,
  },
];

const hostNavItems = [
  {
    name: 'Dashboard',
    href: '/host/dashboard',
    icon: Home,
  },
  {
    name: 'Mes annonces',
    href: '/host/listings',
    icon: Building2,
  },
  {
    name: 'Réservations',
    href: '/host/bookings',
    icon: Calendar,
  },
  {
    name: 'Profil',
    href: '/profile',
    icon: User,
  },
];

export function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const userType = session?.user?.userType;

  // Ne rien afficher si l'utilisateur n'est pas connecté ou si la session est en cours de chargement
  if (status === 'loading' || !session) {
    return null;
  }

  const navItems = userType === 'host' ? hostNavItems : tenantNavItems;

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Bouton Hamburger - Visible uniquement sur mobile */}
      <button
        onClick={toggleMenu}
        className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-white/10 bg-zinc-900/60 hover:bg-zinc-800 transition-colors"
        aria-label="Ouvrir le menu"
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <X className="h-5 w-5 text-white" />
        ) : (
          <Menu className="h-5 w-5 text-white" />
        )}
      </button>

      {/* Overlay - Visible quand le menu est ouvert */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Menu Mobile - Slide in depuis la droite */}
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-zinc-900 border-l border-white/10 z-50 transform transition-transform duration-300 ease-in-out md:hidden',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header du menu */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Menu</h2>
            <button
              onClick={closeMenu}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Fermer le menu"
            >
              <X className="h-5 w-5 text-white" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer du menu */}
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="px-4 py-2">
              <p className="text-xs text-zinc-500 mb-1">Connecté en tant que</p>
              <p className="text-sm text-white truncate">{session?.user?.email}</p>
            </div>
            <Button
              variant="v1-outline"
              size="sm"
              className="w-full"
              onClick={() => {
                closeMenu();
                signOut({ callbackUrl: '/' });
              }}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
