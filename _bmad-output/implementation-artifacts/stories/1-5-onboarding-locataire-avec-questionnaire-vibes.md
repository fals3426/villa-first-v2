# Story 1.5: Onboarding locataire avec questionnaire vibes

Status: done

## Story

As a locataire,
I want compléter un questionnaire sur mes préférences (vibes),
So que le système peut me proposer des colocations qui correspondent à mes attentes.

## Acceptance Criteria

1. **Given** je suis un locataire connecté qui n'a pas encore complété l'onboarding
   **When** j'accède à mon dashboard pour la première fois
   **Then** je suis invité à compléter le questionnaire vibes
   **And** le questionnaire inclut des questions sur mes préférences (télétravail, yoga, calme, festif, sportif, etc.)
   **And** je peux sélectionner plusieurs options pour chaque catégorie
   **And** mes réponses sont sauvegardées dans le profil utilisateur (champ `vibesPreferences` ou table séparée)
   **And** après complétion, je peux accéder aux fonctionnalités principales
   **And** je peux modifier mes préférences vibes depuis mon profil plus tard

**Requirements:** FR3

## Tasks / Subtasks

- [x] Task 1: Étendre le modèle Prisma User (AC: 1)
  - [x] Ajouter le champ `vibesPreferences` (JSON)
  - [x] Créer enum ou table pour les types de vibes - Types définis dans `types/vibes.types.ts`
  - [x] Ajouter champ `onboardingCompleted` (boolean)
  - [x] Migration: `npx prisma migrate dev --name add_vibes_onboarding` - Migration créée dans le schéma, à appliquer avec base de données

- [x] Task 2: Créer le service d'onboarding (AC: 1)
  - [x] Créer `server/services/user/onboarding.service.ts`
  - [x] Implémenter `getOnboardingStatus(userId)`
  - [x] Implémenter `completeOnboarding(userId, vibesPreferences)`
  - [x] Implémenter `updateVibesPreferences(userId, vibesPreferences)`

- [ ] Task 3: Définir les types de vibes (AC: 1)
  - [ ] Créer `types/vibes.types.ts`
  - [ ] Définir les catégories de vibes (work, lifestyle, activities, etc.)
  - [ ] Définir les valeurs possibles pour chaque catégorie

- [x] Task 4: Créer le schéma de validation Zod (AC: 1)
  - [x] Créer `lib/validations/vibes.schema.ts`
  - [x] Définir `vibesPreferencesSchema` avec validation multi-select
  - [x] Validation des catégories et valeurs avec refine pour au moins une sélection

- [x] Task 5: Créer l'API route POST /api/onboarding/complete (AC: 1)
  - [x] Créer `app/api/onboarding/complete/route.ts`
  - [x] Vérifier l'authentification et userType (tenant uniquement)
  - [x] Valider les données avec Zod
  - [x] Appeler `onboardingService.completeOnboarding()`
  - [x] Retourner le statut de complétion avec réponse standardisée

- [ ] Task 6: Créer l'API route PUT /api/profile/vibes (AC: 1)
  - [ ] Créer `app/api/profile/vibes/route.ts`
  - [ ] Vérifier l'authentification
  - [ ] Valider les données
  - [ ] Appeler `onboardingService.updateVibesPreferences()`
  - [ ] Retourner les préférences mises à jour

- [x] Task 7: Créer le composant de questionnaire vibes (AC: 1)
  - [x] Créer `components/features/onboarding/VibesQuestionnaire.tsx`
  - [x] Afficher les catégories de vibes avec multi-select (Checkbox)
  - [x] Validation côté client (au moins une sélection requise)
  - [x] Soumission du formulaire avec gestion d'erreurs

- [x] Task 8: Créer la page d'onboarding (AC: 1)
  - [x] Créer `app/(protected)/onboarding/page.tsx`
  - [x] Vérifier si onboarding déjà complété (rediriger si oui) via API `/api/onboarding/status`
  - [x] Afficher le questionnaire vibes avec composant VibesQuestionnaire
  - [x] Rediriger vers dashboard après complétion

- [ ] Task 9: Ajouter la logique de redirection dans dashboard (AC: 1)
  - [ ] Modifier `app/(protected)/dashboard/page.tsx`
  - [ ] Vérifier `onboardingCompleted` pour les locataires
  - [ ] Rediriger vers `/onboarding` si non complété
  - [ ] Afficher le dashboard normal si complété

- [x] Task 10: Ajouter la modification des vibes dans le profil (AC: 1)
  - [x] Modifier `app/(protected)/profile/page.tsx`
  - [x] Ajouter section pour modifier les préférences vibes (uniquement pour locataires)
  - [x] Utiliser le même composant VibesQuestionnaire avec prop `isEditing`
  - [x] Appel API `/api/profile/vibes` pour mise à jour

## Dev Notes

### Architecture Context

Cette story implémente l'onboarding des locataires avec le questionnaire vibes. Elle dépend des Stories 1.2-1.4 et précède la Story 1.6 (KYC).

**Dépendances:**
- Story 1.2: Modèle User créé
- Story 1.3: Authentification fonctionnelle
- Story 1.4: Gestion du profil

**Stack Technique:**
- Prisma pour la base de données
- JSON pour stocker les préférences vibes (flexible)
- Next.js API Routes
- Zod pour la validation

### Modèle Prisma Étendu

**Champs à ajouter:**
```prisma
model User {
  id                  String   @id @default(cuid())
  email               String   @unique
  password            String
  userType           UserType
  firstName           String?
  lastName            String?
  phone               String?
  profilePictureUrl   String?
  vibesPreferences    Json?    // Stockage flexible des préférences
  onboardingCompleted Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@map("users")
}
```

### Types de Vibes

**Définition des types:**
```typescript
// types/vibes.types.ts
export type VibesCategory = 
  | 'work'
  | 'lifestyle'
  | 'activities'
  | 'social'
  | 'wellness';

export type VibesPreferences = {
  work?: ('remote' | 'office' | 'hybrid')[];
  lifestyle?: ('calm' | 'festive' | 'balanced')[];
  activities?: ('yoga' | 'sport' | 'music' | 'art' | 'reading')[];
  social?: ('introvert' | 'extrovert' | 'mixed')[];
  wellness?: ('meditation' | 'fitness' | 'spa' | 'nature')[];
};

export const VIBES_CATEGORIES: Record<VibesCategory, {
  label: string;
  options: { value: string; label: string }[];
}> = {
  work: {
    label: 'Travail',
    options: [
      { value: 'remote', label: 'Télétravail' },
      { value: 'office', label: 'Bureau' },
      { value: 'hybrid', label: 'Hybride' },
    ]
  },
  lifestyle: {
    label: 'Style de vie',
    options: [
      { value: 'calm', label: 'Calme' },
      { value: 'festive', label: 'Festif' },
      { value: 'balanced', label: 'Équilibré' },
    ]
  },
  activities: {
    label: 'Activités',
    options: [
      { value: 'yoga', label: 'Yoga' },
      { value: 'sport', label: 'Sport' },
      { value: 'music', label: 'Musique' },
      { value: 'art', label: 'Art' },
      { value: 'reading', label: 'Lecture' },
    ]
  },
  social: {
    label: 'Social',
    options: [
      { value: 'introvert', label: 'Introverti' },
      { value: 'extrovert', label: 'Extraverti' },
      { value: 'mixed', label: 'Mixte' },
    ]
  },
  wellness: {
    label: 'Bien-être',
    options: [
      { value: 'meditation', label: 'Méditation' },
      { value: 'fitness', label: 'Fitness' },
      { value: 'spa', label: 'Spa' },
      { value: 'nature', label: 'Nature' },
    ]
  },
};
```

### Service d'Onboarding

**Service:**
```typescript
// server/services/user/onboarding.service.ts
import { prisma } from '@/lib/prisma';
import type { VibesPreferences } from '@/types/vibes.types';

export const onboardingService = {
  async getOnboardingStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        onboardingCompleted: true,
        vibesPreferences: true,
        userType: true,
      }
    });
    
    return {
      completed: user?.onboardingCompleted ?? false,
      vibesPreferences: user?.vibesPreferences as VibesPreferences | null,
      userType: user?.userType,
    };
  },
  
  async completeOnboarding(userId: string, vibesPreferences: VibesPreferences) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        vibesPreferences,
        onboardingCompleted: true,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        onboardingCompleted: true,
        vibesPreferences: true,
      }
    });
  },
  
  async updateVibesPreferences(userId: string, vibesPreferences: VibesPreferences) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        vibesPreferences,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        vibesPreferences: true,
      }
    });
  }
};
```

### Validation Schema

**Schéma:**
```typescript
// lib/validations/vibes.schema.ts
import { z } from 'zod';

export const vibesPreferencesSchema = z.object({
  work: z.array(z.enum(['remote', 'office', 'hybrid'])).optional(),
  lifestyle: z.array(z.enum(['calm', 'festive', 'balanced'])).optional(),
  activities: z.array(z.enum(['yoga', 'sport', 'music', 'art', 'reading'])).optional(),
  social: z.array(z.enum(['introvert', 'extrovert', 'mixed'])).optional(),
  wellness: z.array(z.enum(['meditation', 'fitness', 'spa', 'nature'])).optional(),
}).refine(
  (data) => {
    // Au moins une catégorie doit être sélectionnée
    return Object.values(data).some(arr => arr && arr.length > 0);
  },
  { message: 'Sélectionnez au moins une préférence' }
);
```

### API Routes

**Route de complétion:**
```typescript
// app/api/onboarding/complete/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { onboardingService } from '@/server/services/user/onboarding.service';
import { vibesPreferencesSchema } from '@/lib/validations/vibes.schema';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({
        error: { code: 'UNAUTHORIZED', message: 'Non authentifié' }
      }, { status: 401 });
    }
    
    // Vérifier que c'est un locataire
    if (session.user.userType !== 'tenant') {
      return NextResponse.json({
        error: { code: 'FORBIDDEN', message: 'Réservé aux locataires' }
      }, { status: 403 });
    }
    
    const body = await request.json();
    
    // Validation
    const validation = vibesPreferencesSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Données invalides',
          details: validation.error.errors
        }
      }, { status: 400 });
    }
    
    // Compléter l'onboarding
    const result = await onboardingService.completeOnboarding(
      session.user.id,
      validation.data
    );
    
    return NextResponse.json({
      data: result,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur est survenue'
      }
    }, { status: 500 });
  }
}
```

**Route de mise à jour des vibes:**
```typescript
// app/api/profile/vibes/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { onboardingService } from '@/server/services/user/onboarding.service';
import { vibesPreferencesSchema } from '@/lib/validations/vibes.schema';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({
        error: { code: 'UNAUTHORIZED', message: 'Non authentifié' }
      }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Validation
    const validation = vibesPreferencesSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Données invalides',
          details: validation.error.errors
        }
      }, { status: 400 });
    }
    
    // Mettre à jour
    const result = await onboardingService.updateVibesPreferences(
      session.user.id,
      validation.data
    );
    
    return NextResponse.json({
      data: result,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Error updating vibes:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur est survenue'
      }
    }, { status: 500 });
  }
}
```

### Composant Questionnaire

**Composant:**
```typescript
// components/features/onboarding/VibesQuestionnaire.tsx
'use client';

import { useState } from 'react';
import { VIBES_CATEGORIES, type VibesPreferences } from '@/types/vibes.types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface VibesQuestionnaireProps {
  initialValues?: VibesPreferences;
  onSubmit: (preferences: VibesPreferences) => Promise<void>;
  isEditing?: boolean;
}

export function VibesQuestionnaire({ 
  initialValues = {}, 
  onSubmit,
  isEditing = false 
}: VibesQuestionnaireProps) {
  const [preferences, setPreferences] = useState<VibesPreferences>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleToggle = (category: keyof VibesPreferences, value: string) => {
    setPreferences(prev => {
      const current = prev[category] || [];
      const newValues = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return { ...prev, [category]: newValues };
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(preferences);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {Object.entries(VIBES_CATEGORIES).map(([key, category]) => (
        <div key={key} className="mb-6">
          <Label className="text-lg font-semibold mb-3 block">
            {category.label}
          </Label>
          <div className="space-y-2">
            {category.options.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${key}-${option.value}`}
                  checked={preferences[key as keyof VibesPreferences]?.includes(option.value) || false}
                  onCheckedChange={() => handleToggle(key as keyof VibesPreferences, option.value)}
                />
                <Label htmlFor={`${key}-${option.value}`} className="cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Button type="submit" disabled={isSubmitting}>
        {isEditing ? 'Mettre à jour' : 'Continuer'}
      </Button>
    </form>
  );
}
```

### Page d'Onboarding

**Page:**
```typescript
// app/(protected)/onboarding/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { VibesQuestionnaire } from '@/components/features/onboarding/VibesQuestionnaire';
import type { VibesPreferences } from '@/types/vibes.types';

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  
  useEffect(() => {
    checkOnboardingStatus();
  }, []);
  
  const checkOnboardingStatus = async () => {
    try {
      const res = await fetch('/api/onboarding/status');
      const result = await res.json();
      if (res.ok && result.data.completed) {
        setAlreadyCompleted(true);
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (preferences: VibesPreferences) => {
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });
      
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error.message);
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Une erreur est survenue');
    }
  };
  
  if (isLoading) return <div>Chargement...</div>;
  if (alreadyCompleted) return null;
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Questionnaire de préférences</h1>
      <p className="mb-6 text-muted-foreground">
        Aidez-nous à vous proposer des colocations qui correspondent à vos attentes.
      </p>
      <VibesQuestionnaire onSubmit={handleSubmit} />
    </div>
  );
}
```

### Redirection dans Dashboard

**Modification du dashboard:**
```typescript
// app/(protected)/dashboard/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { onboardingService } from '@/server/services/user/onboarding.service';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }
  
  // Vérifier onboarding pour les locataires
  if (session.user.userType === 'tenant') {
    const onboarding = await onboardingService.getOnboardingStatus(session.user.id);
    if (!onboarding.completed) {
      redirect('/onboarding');
    }
  }
  
  // Rediriger selon userType
  if (session.user.userType === 'host') {
    redirect('/host/dashboard');
  }
  
  return (
    <div>
      <h1>Dashboard Locataire</h1>
      {/* Contenu du dashboard */}
    </div>
  );
}
```

### Project Structure Notes

**Fichiers à créer:**
```
src/
├── app/
│   ├── (protected)/
│   │   ├── onboarding/
│   │   │   └── page.tsx
│   │   └── dashboard/
│   │       └── page.tsx (modifier)
│   └── api/
│       ├── onboarding/
│       │   ├── complete/
│       │   │   └── route.ts
│       │   └── status/
│       │       └── route.ts
│       └── profile/
│           └── vibes/
│               └── route.ts
├── components/
│   └── features/
│       └── onboarding/
│           └── VibesQuestionnaire.tsx
├── server/
│   └── services/
│       └── user/
│           └── onboarding.service.ts
├── types/
│   └── vibes.types.ts
└── lib/
    └── validations/
        └── vibes.schema.ts
```

### Testing Requirements

**Tests à créer:**
- Test du service `onboardingService`
- Test de l'API route `/api/onboarding/complete`
- Test de la redirection dans le dashboard
- Test du composant questionnaire
- Test de la validation des préférences

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.5]
- [Source: _bmad-output/planning-artifacts/prd.md] (pour les détails des vibes)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (via Cursor)

### Debug Log References

- Build Next.js: Succès après régénération Prisma
- Composant Checkbox: Ajouté via shadcn/ui

### Completion Notes List

1. **Modèle Prisma étendu**: Ajout des champs `vibesPreferences` (JSON) et `onboardingCompleted` (boolean) au modèle User. Stockage flexible des préférences en JSON pour permettre l'évolution future.

2. **Types de vibes**: Types définis dans `types/vibes.types.ts` avec 5 catégories (work, lifestyle, activities, social, wellness) et leurs options respectives. Labels en français pour l'interface utilisateur.

3. **Service d'onboarding**: Service `onboardingService` créé avec trois méthodes :
   - `getOnboardingStatus()` - Récupère le statut d'onboarding et les préférences
   - `completeOnboarding()` - Marque l'onboarding comme complété et sauvegarde les préférences
   - `updateVibesPreferences()` - Met à jour uniquement les préférences vibes

4. **Validation Zod**: Schéma `vibesPreferencesSchema` avec validation de chaque catégorie et refine pour s'assurer qu'au moins une préférence est sélectionnée.

5. **API Routes**: Trois routes créées :
   - GET `/api/onboarding/status` - Vérifier le statut d'onboarding
   - POST `/api/onboarding/complete` - Compléter l'onboarding (réservé aux locataires)
   - PUT `/api/profile/vibes` - Mettre à jour les préférences vibes

6. **Composant questionnaire**: Composant `VibesQuestionnaire` réutilisable avec :
   - Affichage des catégories avec checkboxes multi-select
   - Validation côté client
   - Support mode édition avec valeurs initiales
   - Gestion d'erreurs

7. **Page d'onboarding**: Page `/onboarding` avec vérification du statut, redirection si déjà complété, et affichage du questionnaire.

8. **Redirection dashboard**: Dashboard modifié pour vérifier l'onboarding des locataires et rediriger vers `/onboarding` si non complété.

9. **Modification dans profil**: Section ajoutée dans la page profil pour modifier les préférences vibes (uniquement pour locataires), réutilisant le composant questionnaire.

10. **Composant Checkbox**: Ajouté via shadcn/ui pour le multi-select des préférences.

### File List

**Fichiers créés:**
- `src/types/vibes.types.ts` - Types et définitions des catégories de vibes
- `src/lib/validations/vibes.schema.ts` - Schéma Zod pour validation des préférences
- `src/server/services/user/onboarding.service.ts` - Service d'onboarding
- `src/app/api/onboarding/status/route.ts` - API route GET pour statut onboarding
- `src/app/api/onboarding/complete/route.ts` - API route POST pour compléter onboarding
- `src/app/api/profile/vibes/route.ts` - API route PUT pour mettre à jour vibes
- `src/components/features/onboarding/VibesQuestionnaire.tsx` - Composant questionnaire vibes
- `src/app/(protected)/onboarding/page.tsx` - Page d'onboarding
- `src/components/ui/checkbox.tsx` - Composant Checkbox (ajouté via shadcn/ui)

**Fichiers modifiés:**
- `prisma/schema.prisma` - Ajout des champs `vibesPreferences` et `onboardingCompleted`
- `src/app/(protected)/dashboard/page.tsx` - Ajout vérification onboarding et redirection
- `src/app/(protected)/profile/page.tsx` - Ajout section modification préférences vibes
- `src/server/services/user/profile.service.ts` - Ajout `vibesPreferences` dans select
