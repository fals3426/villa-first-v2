'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { memo } from 'react';
import { 
  Search, 
  Heart, 
  MessageSquare, 
  User, 
  Home,
  Building2,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
}

function NavItem({ href, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center justify-center gap-1 min-w-[60px] py-2 px-3 rounded-lg transition-colors',
        'touch-target-min', // Minimum 44px de hauteur pour zone de tap
        isActive && 'bg-white/10'
      )}
      aria-label={label}
    >
      <Icon 
        className={cn(
          'h-5 w-5 transition-colors',
          isActive ? 'text-white' : 'text-zinc-400'
        )} 
      />
      <span 
        className={cn(
          'text-xs font-medium transition-colors',
          isActive ? 'text-white' : 'text-zinc-400'
        )}
      >
        {label}
      </span>
    </Link>
  );
}

function MobileBottomNavigationComponent() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const userType = session?.user?.userType;

  // Ne rien afficher si l'utilisateur n'est pas connecté ou si la session est en cours de chargement
  if (status === 'loading' || !session) {
    return null;
  }

  // Ne pas afficher sur certaines pages (login, register, etc.)
  if (pathname?.startsWith('/login') || pathname?.startsWith('/register')) {
    return null;
  }

  // Items de navigation pour locataires
  const tenantNavItems = [
    {
      href: '/listings',
      icon: Search,
      label: 'Explorer',
    },
    {
      href: '/watchlist',
      icon: Heart,
      label: 'Favoris',
    },
    {
      href: '/chat',
      icon: MessageSquare,
      label: 'Messages',
    },
    {
      href: '/profile',
      icon: User,
      label: 'Profil',
    },
  ];

  // Items de navigation pour hôtes (max 5 items selon spec UX)
  const hostNavItems = [
    {
      href: '/host/dashboard',
      icon: Home,
      label: 'Accueil',
    },
    {
      href: '/host/listings',
      icon: Building2,
      label: 'Annonces',
    },
    {
      href: '/host/bookings',
      icon: Calendar,
      label: 'Réservations',
    },
    {
      href: '/chat',
      icon: MessageSquare,
      label: 'Messages',
    },
    {
      href: '/profile',
      icon: User,
      label: 'Profil',
    },
  ];

  const navItems = userType === 'host' ? hostNavItems : tenantNavItems;

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-white/10 md:hidden shadow-lg backdrop-blur-md"
      aria-label="Navigation principale mobile"
    >
      <div className="flex items-center justify-around h-16 px-2 safe-area-bottom">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              isActive={isActive}
            />
          );
        })}
      </div>
    </nav>
  );
}

// Envelopper avec React.memo pour éviter re-renders inutiles
export const MobileBottomNavigation = memo(MobileBottomNavigationComponent);
MobileBottomNavigation.displayName = 'MobileBottomNavigation';
