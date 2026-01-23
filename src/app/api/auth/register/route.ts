import { NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validations/auth.schema';
import { userService } from '@/server/services/auth/user.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Données invalides',
            details: validation.error.issues,
          },
        },
        { status: 400 }
      );
    }

    // Créer utilisateur
    const user = await userService.createUser(
      validation.data.email,
      validation.data.password,
      validation.data.userType
    );

    return NextResponse.json(
      {
        data: user,
        meta: { timestamp: new Date().toISOString() },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    // Gérer erreurs spécifiques
    if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
      return NextResponse.json(
        {
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Cet email est déjà utilisé',
          },
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Une erreur est survenue lors de la création du compte',
        },
      },
      { status: 500 }
    );
  }
}
