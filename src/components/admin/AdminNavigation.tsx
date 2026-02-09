'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  AlertTriangle, 
  Users, 
  Home, 
  Calendar,
  FileText,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { signOut } from 'next-auth/react';

const navigationItems = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Vérifications',
    href: '/admin/verifications',
    icon: ShieldCheck,
  },
  {
    name: 'Incidents',
    href: '/admin/incidents',
    icon: AlertTriangle,
  },
  {
    name: 'Utilisateurs',
    href: '/admin/users',
    icon: Users,
  },
  {
    name: 'Annonces',
    href: '/admin/listings',
    icon: Home,
  },
  {
    name: 'Réservations',
    href: '/admin/bookings',
    icon: Calendar,
  },
  {
    name: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: FileText,
  },
];

/**
 * Navigation latérale pour le back-office support (Story 9.1)
 */
export function AdminNavigation() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold">Back-Office Support</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestion de la plateforme</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => signOut({ callbackUrl: '/login' })}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </div>
    </aside>
  );
}
