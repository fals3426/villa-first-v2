/**
 * Réinitialise le mot de passe admin (DEV uniquement)
 * POST /api/debug/reset-admin
 * Body: { "password": "Admin123" } ou sans body pour utiliser Admin123
 */
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

const ADMIN_EMAIL = 'admin@villafirst.com';
const DEFAULT_PASSWORD = 'Admin123';

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Non disponible en production' }, { status: 404 });
  }

  try {
    let password = DEFAULT_PASSWORD;
    try {
      const body = await request.json();
      if (body?.password) password = body.password;
    } catch {
      // Pas de body ou JSON invalide = utiliser défaut
    }

    const user = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });

    if (!user) {
      const hashedPassword = await hash(password, 12);
      await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          password: hashedPassword,
          userType: 'support',
        },
      });
      return NextResponse.json({
        success: true,
        action: 'created',
        email: ADMIN_EMAIL,
        password,
        message: 'Compte admin créé. Connecte-toi maintenant.',
      });
    }

    const hashedPassword = await hash(password, 12);
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { password: hashedPassword, userType: 'support' },
    });

    return NextResponse.json({
      success: true,
      action: 'updated',
      email: ADMIN_EMAIL,
      password,
      message: 'Mot de passe réinitialisé. Connecte-toi avec ces identifiants.',
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
