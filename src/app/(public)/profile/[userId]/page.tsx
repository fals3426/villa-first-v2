import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VibeTag, type VibeType } from '@/components/features/vibes/VibeTag';
import { VIBES_CATEGORIES, type VibesCategory, type VibesPreferences } from '@/types/vibes.types';
import { ArrowLeft, UserCircle, Mail } from 'lucide-react';

type VibesFromPreferences = (preferences: VibesPreferences | null) => VibeType[];

const extractVibesFromPreferences: VibesFromPreferences = (preferences) => {
  const vibes: VibeType[] = [];
  if (!preferences) return vibes;

  const work = preferences.work || [];
  const lifestyle = preferences.lifestyle || [];
  const activities = preferences.activities || [];
  const social = preferences.social || [];
  const wellness = preferences.wellness || [];

  if (work.includes('remote')) vibes.push('remote');
  if (lifestyle.includes('calm')) vibes.push('calm');
  if (lifestyle.includes('festive')) vibes.push('social');
  if (activities.includes('yoga') || wellness.includes('meditation')) {
    vibes.push('spiritual');
  }

  return vibes;
};

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      profilePictureUrl: true,
      email: true,
      userType: true,
      vibesPreferences: true,
    },
  });

  if (!user) {
    notFound();
  }

  const userName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Colocataire';
  const vibesPreferences = (user.vibesPreferences as VibesPreferences) || null;
  const userVibes = extractVibesFromPreferences(vibesPreferences);

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      <div className="container mx-auto max-w-2xl p-4 md:p-6 space-y-6">
        {/* Retour */}
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux annonces
        </Link>

        {/* Profil */}
        <Card variant="v1-default">
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden bg-zinc-800 border-2 border-white/10">
                {user.profilePictureUrl ? (
                  <Image
                    src={user.profilePictureUrl}
                    alt={userName}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <UserCircle className="h-10 w-10 text-zinc-500" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-white text-xl">{userName}</CardTitle>
                <p className="text-sm text-zinc-400 mt-1">
                  {user.userType === 'host' ? 'Hôte' : 'Colocataire'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vibes */}
            {userVibes.length > 0 && (
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-3">Vibes</p>
                <div className="flex flex-wrap gap-2">
                  {userVibes.map((vibe) => (
                    <VibeTag key={vibe} vibe={vibe} variant="standard" />
                  ))}
                </div>
              </div>
            )}

            {/* Préférences détaillées */}
            {vibesPreferences && (
              <div>
                <p className="text-sm font-medium text-zinc-400 mb-3">Préférences</p>
                <div className="space-y-3">
                  {(Object.keys(VIBES_CATEGORIES) as VibesCategory[]).map((category) => {
                    const selected = vibesPreferences[category];
                    if (!selected?.length) return null;
                    const config = VIBES_CATEGORIES[category];
                    const labels = selected
                      .map((v) => config.options.find((o) => o.value === v)?.label ?? v)
                      .filter(Boolean);
                    return (
                      <div key={category} className="text-white/90">
                        <span className="font-medium text-zinc-300">{config.label}:</span>{' '}
                        {labels.join(', ')}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Message de confidentialité */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-zinc-500">
                Les informations de contact ne sont visibles qu&apos;après réservation confirmée.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
