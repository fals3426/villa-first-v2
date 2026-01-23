import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { kycService } from '@/server/services/kyc/kyc.service';
import { redirect } from 'next/navigation';

/**
 * Middleware pour protéger les routes nécessitant une vérification KYC
 * Redirige vers /login si non authentifié
 * Redirige vers /kyc si KYC non vérifié
 */
export async function requireKycVerified() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const isVerified = await kycService.checkKycVerified(session.user.id);

  if (!isVerified) {
    redirect('/kyc?required=true');
  }

  return session;
}
