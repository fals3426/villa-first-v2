import { prisma } from '@/lib/prisma';
import type { VibesPreferences } from '@/types/vibes.types';

export const onboardingService = {
  async getOnboardingStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        onboardingCompleted: true,
        vibesPreferences: true,
        userType: true,
      },
    });

    return {
      completed: user?.onboardingCompleted ?? false,
      vibesPreferences: (user?.vibesPreferences as VibesPreferences) || null,
      userType: user?.userType,
    };
  },

  async completeOnboarding(
    userId: string,
    vibesPreferences: VibesPreferences
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        vibesPreferences: vibesPreferences as any,
        onboardingCompleted: true,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        onboardingCompleted: true,
        vibesPreferences: true,
      },
    });
  },

  async updateVibesPreferences(
    userId: string,
    vibesPreferences: VibesPreferences
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        vibesPreferences: vibesPreferences as any,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        vibesPreferences: true,
      },
    });
  },
};
