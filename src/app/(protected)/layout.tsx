import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { MainNavigation } from '@/components/navigation/MainNavigation';
import { MobileBottomNavigation } from '@/components/navigation/MobileBottomNavigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-black">
      <MainNavigation />
      <main className="pb-16 md:pb-0">
        {children}
      </main>
      <MobileBottomNavigation />
    </div>
  );
}
