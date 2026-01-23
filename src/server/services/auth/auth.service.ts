import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export const authService = {
  async verifyCredentials(email: string, password: string) {
    // Normaliser email
    const normalizedEmail = email.toLowerCase().trim();

    // Trouver utilisateur
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        password: true,
        userType: true,
      },
    });

    if (!user) {
      return null;
    }

    // Vérifier mot de passe
    const isValid = await compare(password, user.password);
    if (!isValid) {
      return null;
    }

    // Retourner utilisateur (sans password)
    return {
      id: user.id,
      email: user.email,
      userType: user.userType,
    };
  },
};
