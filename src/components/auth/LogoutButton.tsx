'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      aria-label="Se déconnecter de votre compte"
    >
      Déconnexion
    </Button>
  );
}
