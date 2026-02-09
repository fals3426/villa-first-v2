import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

/**
 * Middleware pour protéger les routes admin/support (Story 9.1)
 * Vérifie que l'utilisateur a le rôle "support"
 */
export async function requireSupport() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  if (session.user.userType !== 'support') {
    redirect('/dashboard');
  }

  return session;
}

/**
 * Vérifie si l'utilisateur est support (retourne boolean)
 */
export async function isSupport(): Promise<boolean> {
  const session = await getServerSession(authOptions);
  return session?.user?.userType === 'support';
}
