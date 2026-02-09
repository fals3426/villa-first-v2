'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { VibesQuestionnaire } from '@/components/features/onboarding/VibesQuestionnaire';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { VibesPreferences } from '@/types/vibes.types';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    checkOnboardingStatus();
  }, [status]);

  const checkOnboardingStatus = async () => {
    try {
      const res = await fetch('/api/onboarding/status');
      const result = await res.json();
      if (res.ok) {
        if (result.data.completed) {
          setAlreadyCompleted(true);
          router.push('/dashboard');
          return;
        }
        // Vérifier que c'est un locataire
        if (result.data.userType !== 'tenant') {
          router.push('/dashboard');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (preferences: VibesPreferences) => {
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error?.message || 'Une erreur est survenue');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-400">Chargement...</div>
      </div>
    );
  }

  if (alreadyCompleted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="space-y-8">
          <div>
            <p className="text-label mb-2">ONBOARDING</p>
            <h1 className="text-heading-2 mb-2">
              Questionnaire de préférences
            </h1>
            <p className="text-white/90">
              Aide-nous à te proposer des colocs qui correspondent à tes
              attentes. Sélectionne toutes les options qui t'intéressent.
            </p>
          </div>

          <Card variant="v1-default">
            <CardContent className="pt-6">
              <VibesQuestionnaire onSubmit={handleSubmit} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
