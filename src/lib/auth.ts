import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authService } from '@/server/services/auth/auth.service';
import { onboardingService } from '@/server/services/user/onboarding.service';

export const authOptions: NextAuthOptions = {
  trustHost: true, // requis en dev (localhost) avec middleware
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const authStartTime = Date.now();
        
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await authService.verifyCredentials(
          credentials.email,
          credentials.password
        );

        if (!user) {
          if (process.env.NODE_ENV === 'development') {
            console.log(`[NextAuth] Authorization failed - Total: ${Date.now() - authStartTime}ms`);
          }
          return null;
        }

        const authTime = Date.now() - authStartTime;
        if (process.env.NODE_ENV === 'development') {
          console.log(`[NextAuth] Authorization success - Total: ${authTime}ms`);
        }

        return {
          id: user.id,
          email: user.email,
          userType: user.userType,
          onboardingCompleted: user.onboardingCompleted,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },
  callbacks: {
    async jwt({ token, user }) {
      // Nouvelle connexion : remplir le token depuis l'utilisateur
      if (user) {
        token.id = user.id;
        token.userType = user.userType;
        token.onboardingCompleted = user.onboardingCompleted;
        return token;
      }
      // Session existante : rafraîchir onboardingCompleted depuis la BDD
      // (après complétion de l'onboarding, le JWT n'est pas re-signé, donc on lit la BDD)
      if (token.id) {
        try {
          const status = await onboardingService.getOnboardingStatus(token.id as string);
          token.onboardingCompleted = status.completed;
        } catch {
          // En cas d'erreur, garder la valeur actuelle du token
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Optimisation : assignation directe sans vérifications supplémentaires
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.userType = token.userType;
        session.user.onboardingCompleted = token.onboardingCompleted;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
