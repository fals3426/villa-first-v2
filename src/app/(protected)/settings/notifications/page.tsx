import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { NotificationPreferences } from '@/components/features/notifications/NotificationPreferences';

/**
 * Page de préférences de notifications (Story 6.6)
 */
export default async function NotificationsSettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto max-w-4xl p-6">
        <div className="mb-8">
          <p className="text-label mb-2">PARAMÈTRES</p>
          <h1 className="text-heading-2">Notifications</h1>
          <p className="text-white/90 mt-2">
            Configure tes préférences de notifications
          </p>
        </div>
        <NotificationPreferences />
      </div>
    </div>
  );
}
