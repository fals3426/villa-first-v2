import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkinService } from '@/server/services/checkin/checkin.service';

/**
 * POST /api/bookings/[id]/checkin
 * 
 * Effectue un check-in pour une réservation (Story 8.1, 8.2, 8.3)
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: bookingId } = await context.params;

    // Récupérer les données du formulaire (FormData pour la photo)
    const formData = await request.formData();
    const photo = formData.get('photo') as File | null;
    const latitudeStr = formData.get('latitude') as string | null;
    const longitudeStr = formData.get('longitude') as string | null;

    if (!photo) {
      return NextResponse.json(
        { error: 'La photo est obligatoire' },
        { status: 400 }
      );
    }

    // Valider la photo (format et taille)
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(photo.type)) {
      return NextResponse.json(
        { error: 'Format de photo invalide. Formats acceptés: JPG, PNG' },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (photo.size > maxSize) {
      return NextResponse.json(
        { error: 'La photo est trop volumineuse. Taille maximale: 10MB' },
        { status: 400 }
      );
    }

    // Parser les coordonnées GPS si fournies
    let latitude: number | undefined;
    let longitude: number | undefined;

    if (latitudeStr && longitudeStr) {
      latitude = parseFloat(latitudeStr);
      longitude = parseFloat(longitudeStr);

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          { error: 'Coordonnées GPS invalides' },
          { status: 400 }
        );
      }
    }

    // Effectuer le check-in
    const checkIn = await checkinService.performCheckIn(bookingId, session.user.id, {
      photo,
      latitude,
      longitude,
    });

    return NextResponse.json(
      {
        success: true,
        data: checkIn,
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors du check-in:', error);

    if (error instanceof Error) {
      if (error.message === 'BOOKING_NOT_FOUND') {
        return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
      }
      if (error.message === 'NOT_AUTHORIZED') {
        return NextResponse.json(
          { error: 'Vous n\'êtes pas autorisé à effectuer ce check-in' },
          { status: 403 }
        );
      }
      if (error.message === 'BOOKING_NOT_CONFIRMED') {
        return NextResponse.json(
          { error: 'Cette réservation n\'est pas encore confirmée' },
          { status: 400 }
        );
      }
      if (error.message === 'CHECKIN_ALREADY_EXISTS') {
        return NextResponse.json(
          { error: 'Un check-in a déjà été effectué pour cette réservation' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors du check-in' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/bookings/[id]/checkin
 * 
 * Récupère les check-ins d'une réservation (Story 8.1, 8.3)
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { id: bookingId } = await context.params;
    const checkIns = await checkinService.getCheckInsForBooking(bookingId, session.user.id);

    return NextResponse.json(
      {
        data: checkIns,
        meta: {
          count: checkIns.length,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la récupération des check-ins:', error);

    if (error instanceof Error) {
      if (error.message === 'BOOKING_NOT_FOUND') {
        return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
      }
      if (error.message === 'NOT_AUTHORIZED') {
        return NextResponse.json(
          { error: 'Vous n\'êtes pas autorisé à voir ces check-ins' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Erreur lors de la récupération des check-ins' },
      { status: 500 }
    );
  }
}
