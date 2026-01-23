import { prisma } from '@/lib/prisma';

export const profileService = {
  async getProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profilePictureUrl: true,
        userType: true,
        vibesPreferences: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      phone?: string;
      profilePictureUrl?: string;
    }
  ) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profilePictureUrl: true,
        userType: true,
        updatedAt: true,
      },
    });
  },
};
