import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AdminNavigation } from '@/components/admin/AdminNavigation';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  if (session.user.userType !== 'support') {
    // Redirect to login with error message for unauthorized access
    redirect('/login?error=unauthorized');
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Navigation latérale */}
        <AdminNavigation />

        {/* Contenu principal */}
        <main className="flex-1 ml-64">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
