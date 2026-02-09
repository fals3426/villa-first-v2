'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useMemo, memo, useCallback } from 'react';
import { 
  Home, 
  Search, 
  Calendar, 
  User, 
  LogOut,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';
import { MobileNavigation } from './MobileNavigation';

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

const supportNavItems = [
  {
    name: 'Back-office',
    href: '/admin/dashboard',
    icon: Building2,
  },
  {
    name: 'Rechercher',
    href: '/listings',
    icon: Search,
  },
  {
    name: 'Profil',
    href: '/profile',
    icon: User,
  },
];

function MainNavigationComponent() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const userType = session?.user?.userType;

  // Mémoriser navItems pour éviter recalcul à chaque render
  // IMPORTANT: Tous les hooks doivent être appelés AVANT tout return conditionnel
  const navItems = useMemo(
    () => {
      if (userType === 'host') return hostNavItems;
      if (userType === 'support') return supportNavItems;
      return tenantNavItems;
    },
    [userType]
  );

  // Mémoriser callback de déconnexion
  const handleSignOut = useCallback(() => {
    signOut({ callbackUrl: '/' });
  }, []);

  // Ne rien afficher si l'utilisateur n'est pas connecté ou si la session est en cours de chargement
  // Ce return doit être APRÈS tous les hooks
  if (status === 'loading' || !session) {
    return null;
  }

  return (
    <nav className="border-b border-white/10 bg-black/95 backdrop-blur-md sticky top-0 z-50 safe-area-top">
      <div className="container mx-auto flex h-14 md:h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center space-x-4 md:space-x-8">
          <Link href={userType === 'host' ? '/host/dashboard' : '/dashboard'} className="text-lg md:text-xl font-semibold text-white">
            Villa first
          </Link>
          
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors touch-target-min ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Navigation Mobile */}
          <MobileNavigation />
          
          {/* Desktop Navigation */}
          <span className="text-xs md:text-sm text-zinc-400 hidden lg:inline">
            {session?.user?.email}
          </span>
          <Button
            variant="v1-ghost"
            size="sm"
            className="hidden sm:flex"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="hidden lg:inline">Déconnexion</span>
          </Button>
        </div>
      </div>
    </nav>
  );
}

// Envelopper avec React.memo pour éviter re-renders inutiles
export const MainNavigation = memo(MainNavigationComponent);
MainNavigation.displayName = 'MainNavigation';
