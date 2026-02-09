/**
 * Route de diagnostic (DEV uniquement) - teste si les identifiants fonctionnent
 * GET /api/debug/verify-login?email=admin@villafirst.com&password=Admin123
 */
import { NextResponse } from 'next/server';
import { authService } from '@/server/services/auth/auth.service';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Non disponible en production' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email') || 'admin@villafirst.com';
  const password = searchParams.get('password') || 'Admin123';

  try {
    // 1. Vérifier si l'utilisateur existe
    const userInDb = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, email: true, userType: true },
    });

    // 2. Tester la validation des credentials
    const authResult = await authService.verifyCredentials(email, password);

    return NextResponse.json({
      diagnostic: {
        emailSaisi: email,
        utilisateurExiste: !!userInDb,
        utilisateur: userInDb
          ? { id: userInDb.id, email: userInDb.email, userType: userInDb.userType }
          : null,
        authReussie: !!authResult,
        authResult: authResult ? { id: authResult.id, email: authResult.email, userType: authResult.userType } : null,
      },
      conseil: !userInDb
        ? 'Utilisateur non trouvé. Exécute: npm run create-support-user'
        : !authResult
          ? 'Mot de passe incorrect. Exécute: npm run create-support-user pour réinitialiser'
          : 'Les identifiants sont valides. Le problème vient peut-être de NextAuth.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Erreur diagnostic',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
