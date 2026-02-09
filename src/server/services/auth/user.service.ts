import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

// Fonction helper pour retry avec backoff exponentiel
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Si c'est une erreur de connexion, on retry
      if (
        lastError.message.includes('Connection terminated') ||
        lastError.message.includes('Connection closed') ||
        lastError.message.includes('ECONNREFUSED')
      ) {
        if (attempt < maxRetries - 1) {
          // Attendre avant de retry (backoff exponentiel)
          await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt)));
          continue;
        }
      }
      
      // Si ce n'est pas une erreur de connexion, on propage l'erreur
      throw lastError;
    }
  }
  
  throw lastError || new Error('Unknown error');
}

export const userService = {
  async createUser(
    email: string,
    password: string,
    userType: 'tenant' | 'host' | 'support'
  ) {
    return retryWithBackoff(async () => {
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
    });
  },
};
