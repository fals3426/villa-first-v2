import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

export const userService = {
  async createUser(
    email: string,
    password: string,
    userType: 'tenant' | 'host'
  ) {
    // Normaliser email
    const normalizedEmail = email.toLowerCase().trim();

    // Vérifier unicité
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Hasher mot de passe
    const hashedPassword = await hash(password, 12);

    // Créer utilisateur
    return prisma.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        userType,
      },
      select: {
        id: true,
        email: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
        // Ne jamais retourner le password
      },
    });
  },
};
