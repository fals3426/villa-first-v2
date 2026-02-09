import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export const authService = {
  async verifyCredentials(email: string, password: string) {
    const startTime = Date.now();
    
    // Validation précoce : vérifier format email basique avant requête DB
    if (!email || !password || email.length < 3 || password.length < 1) {
      return null;
    }

    // Normaliser email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Validation email format basique (évite requête DB si email invalide)
    if (!normalizedEmail.includes('@') || normalizedEmail.length < 5) {
      return null;
    }

    const normalizeTime = Date.now() - startTime;

    // Trouver utilisateur (optimisé avec select minimal, index unique sur email)
    const queryStartTime = Date.now();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        password: true,
        userType: true,
        onboardingCompleted: true,
      },
    });
    const queryTime = Date.now() - queryStartTime;

    if (!user) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Auth] User not found - Normalize: ${normalizeTime}ms, Query: ${queryTime}ms, Total: ${Date.now() - startTime}ms`);
      }
      return null;
    }

    // Vérifier mot de passe (bcrypt peut être lent, c'est normal pour sécurité)
    // Note: bcrypt compare prend généralement 50-200ms avec 12 rounds
    const compareStartTime = Date.now();
    const isValid = await compare(password, user.password);
    const compareTime = Date.now() - compareStartTime;

    if (!isValid) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Auth] Invalid password - Normalize: ${normalizeTime}ms, Query: ${queryTime}ms, Compare: ${compareTime}ms, Total: ${Date.now() - startTime}ms`);
      }
      return null;
    }

    const totalTime = Date.now() - startTime;
    
    // Log performance en développement uniquement
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Auth] Success - Normalize: ${normalizeTime}ms, Query: ${queryTime}ms, Compare: ${compareTime}ms, Total: ${totalTime}ms`);
      
      // Avertissement si compare prend trop de temps (>300ms)
      if (compareTime > 300) {
        console.warn(`[Auth] Warning: bcrypt compare took ${compareTime}ms (consider checking bcrypt rounds)`);
      }
    }

    // Retourner utilisateur (sans password)
    return {
      id: user.id,
      email: user.email,
      userType: user.userType,
      onboardingCompleted: user.onboardingCompleted ?? false,
    };
  },
};
