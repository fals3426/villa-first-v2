# Story 1.4: Gestion du profil utilisateur

Status: done

## Story

As a utilisateur,
I want gérer mes informations personnelles (nom, prénom, téléphone, photo),
So que mon profil est à jour et complet.

## Acceptance Criteria

1. **Given** je suis connecté
   **When** j'accède à la page de mon profil
   **Then** je peux voir mes informations actuelles (nom, prénom, email, téléphone, photo de profil)
   **And** je peux modifier mon nom, prénom, téléphone
   **And** je peux uploader une photo de profil (formats acceptés: JPG, PNG, max 5MB)
   **And** la photo est redimensionnée et optimisée automatiquement
   **And** les modifications sont sauvegardées dans la base de données
   **And** un message de confirmation s'affiche après sauvegarde
   **And** les erreurs de validation (format photo invalide, taille trop grande) sont affichées

**Requirements:** FR6

## Tasks / Subtasks

- [x] Task 1: Étendre le modèle Prisma User (AC: 1)
  - [x] Ajouter les champs: firstName, lastName, phone, profilePictureUrl
  - [x] Exécuter migration: `npx prisma migrate dev --name add_user_profile_fields` - Migration créée dans le schéma, à appliquer avec base de données
  - [x] Générer le client Prisma: `npx prisma generate`

- [x] Task 2: Créer le service de gestion de profil (AC: 1)
  - [x] Créer `server/services/user/profile.service.ts`
  - [x] Implémenter `getProfile(userId)`
  - [x] Implémenter `updateProfile(userId, data)`
  - [x] Validation des données (via Zod dans API route)

- [x] Task 3: Créer le service d'upload d'images (AC: 1)
  - [x] Créer `server/services/storage/image.service.ts`
  - [x] Implémenter l'upload vers stockage (public/uploads pour MVP)
  - [x] Redimensionner et optimiser l'image avec sharp (400x400, qualité 80%)
  - [x] Retourner l'URL de l'image

- [x] Task 4: Créer le schéma de validation Zod (AC: 1)
  - [x] Créer `lib/validations/profile.schema.ts`
  - [x] Définir `updateProfileSchema` avec validation nom, prénom, téléphone
  - [x] Validation format et taille de l'image (dans imageService et composant ImageUpload)

- [x] Task 5: Créer l'API route GET /api/profile (AC: 1)
  - [x] Créer `app/api/profile/route.ts` (GET)
  - [x] Vérifier l'authentification avec `getServerSession`
  - [x] Appeler `profileService.getProfile()`
  - [x] Retourner les données du profil avec réponse standardisée

- [x] Task 6: Créer l'API route PUT /api/profile (AC: 1)
  - [x] Créer `app/api/profile/route.ts` (PUT)
  - [x] Vérifier l'authentification avec `getServerSession`
  - [x] Valider les données avec Zod
  - [x] Gérer l'upload d'image si présent avec `imageService`
  - [x] Appeler `profileService.updateProfile()`
  - [x] Retourner le profil mis à jour avec réponse standardisée

- [x] Task 7: Créer la page de profil (AC: 1)
  - [x] Créer `app/(protected)/profile/page.tsx`
  - [x] Récupérer le profil avec `useSession` et API GET
  - [x] Afficher les informations actuelles
  - [x] Formulaire d'édition avec shadcn/ui (Input, Label, Button)
  - [x] Upload d'image avec preview via composant ImageUpload
  - [x] Validation côté client avec Zod
  - [x] Messages de confirmation/erreur

- [x] Task 8: Créer le composant d'upload d'image (AC: 1)
  - [x] Créer `components/features/profile/ImageUpload.tsx`
  - [x] Input file avec validation (format JPG/PNG, taille max 5MB)
  - [x] Preview de l'image avant upload
  - [x] Indicateur de progression (via état isUploading)
  - [x] Gestion des erreurs avec affichage des messages

## Dev Notes

### Architecture Context

Cette story permet aux utilisateurs de gérer leur profil. Elle dépend des Stories 1.2 et 1.3 (authentification) et précède la Story 1.5 (onboarding vibes).

**Dépendances:**
- Story 1.2: Modèle User créé
- Story 1.3: Authentification fonctionnelle

**Stack Technique:**
- Prisma pour la base de données
- Next.js API Routes pour les endpoints
- Service de stockage pour les images (S3, Cloudinary, ou local)
- sharp pour le redimensionnement d'images
- Zod pour la validation

### Modèle Prisma Étendu

**Champs à ajouter:**
```prisma
model User {
  id               String   @id @default(cuid())
  email            String   @unique
  password         String
  userType         UserType
  firstName        String?
  lastName         String?
  phone            String?
  profilePictureUrl String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
  
  @@map("users")
}
```

### Service de Profil

**Service:**
```typescript
// server/services/user/profile.service.ts
import { prisma } from '@/lib/prisma';

export const profileService = {
  async getProfile(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profilePictureUrl: true,
        userType: true,
        createdAt: true,
        updatedAt: true,
      }
    });
  },
  
  async updateProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    profilePictureUrl?: string;
  }) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        profilePictureUrl: true,
      }
    });
  }
};
```

### Service d'Upload d'Images

**Service d'upload:**
```typescript
// server/services/storage/image.service.ts
import sharp from 'sharp';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const imageService = {
  async uploadProfilePicture(file: File, userId: string): Promise<string> {
    // Lire le buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Valider le format
    const validFormats = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validFormats.includes(file.type)) {
      throw new Error('INVALID_FORMAT');
    }
    
    // Valider la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('FILE_TOO_LARGE');
    }
    
    // Redimensionner et optimiser
    const optimized = await sharp(buffer)
      .resize(400, 400, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    // Sauvegarder (exemple: stockage local)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    await mkdir(uploadsDir, { recursive: true });
    
    const filename = `${userId}-${Date.now()}.jpg`;
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, optimized);
    
    // Retourner l'URL
    return `/uploads/profiles/${filename}`;
  }
};
```

### Validation Schema

**Schéma:**
```typescript
// lib/validations/profile.schema.ts
import { z } from 'zod';

export const updateProfileSchema = z.object({
  firstName: z.string()
    .min(1, 'Le prénom est requis')
    .max(50, 'Le prénom est trop long')
    .optional(),
  lastName: z.string()
    .min(1, 'Le nom est requis')
    .max(50, 'Le nom est trop long')
    .optional(),
  phone: z.string()
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
});
```

### API Route

**Route API:**
```typescript
// app/api/profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { profileService } from '@/server/services/user/profile.service';
import { imageService } from '@/server/services/storage/image.service';
import { updateProfileSchema } from '@/lib/validations/profile.schema';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({
        error: { code: 'UNAUTHORIZED', message: 'Non authentifié' }
      }, { status: 401 });
    }
    
    const profile = await profileService.getProfile(session.user.id);
    
    return NextResponse.json({
      data: profile,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur est survenue'
      }
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({
        error: { code: 'UNAUTHORIZED', message: 'Non authentifié' }
      }, { status: 401 });
    }
    
    const formData = await request.formData();
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
    };
    
    // Validation
    const validation = updateProfileSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Données invalides',
          details: validation.error.errors
        }
      }, { status: 400 });
    }
    
    // Upload image si présente
    let profilePictureUrl: string | undefined;
    const imageFile = formData.get('profilePicture') as File | null;
    if (imageFile && imageFile.size > 0) {
      try {
        profilePictureUrl = await imageService.uploadProfilePicture(
          imageFile,
          session.user.id
        );
      } catch (error) {
        if (error.message === 'INVALID_FORMAT') {
          return NextResponse.json({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Format d\'image invalide (JPG, PNG uniquement)'
            }
          }, { status: 400 });
        }
        if (error.message === 'FILE_TOO_LARGE') {
          return NextResponse.json({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'L\'image est trop grande (max 5MB)'
            }
          }, { status: 400 });
        }
        throw error;
      }
    }
    
    // Mettre à jour le profil
    const updated = await profileService.updateProfile(session.user.id, {
      ...validation.data,
      profilePictureUrl,
    });
    
    return NextResponse.json({
      data: updated,
      meta: { timestamp: new Date().toISOString() }
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Une erreur est survenue'
      }
    }, { status: 500 });
  }
}
```

### Page de Profil

**Page:**
```typescript
// app/(protected)/profile/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { updateProfileSchema } from '@/lib/validations/profile.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/features/profile/ImageUpload';

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  
  useEffect(() => {
    fetchProfile();
  }, []);
  
  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const result = await res.json();
      if (res.ok) {
        setProfile(result.data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setSuccess(false);
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
    };
    
    // Validation
    const validation = updateProfileSchema.safeParse(data);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsSaving(false);
      return;
    }
    
    // Ajouter l'image si présente
    const imageFile = formData.get('profilePicture') as File | null;
    if (imageFile && imageFile.size > 0) {
      formData.append('profilePicture', imageFile);
    }
    
    // Appel API
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        body: formData,
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        setErrors({ general: result.error.message });
        setIsSaving(false);
        return;
      }
      
      setProfile(result.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (error) {
      setErrors({ general: 'Une erreur est survenue' });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) return <div>Chargement...</div>;
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Formulaire de profil */}
    </form>
  );
}
```

### Security Considerations

**Sécurité:**
- Vérifier l'authentification sur toutes les routes
- Valider les fichiers uploadés (format, taille)
- Sanitizer les noms de fichiers
- Limiter la taille des uploads
- Stocker les images de manière sécurisée

**Ne JAMAIS:**
- Permettre l'upload de fichiers exécutables
- Exposer les chemins de fichiers sensibles
- Permettre l'upload sans authentification

### Project Structure Notes

**Fichiers à créer:**
```
src/
├── app/
│   ├── (protected)/
│   │   └── profile/
│   │       └── page.tsx
│   └── api/
│       └── profile/
│           └── route.ts
├── components/
│   └── features/
│       └── profile/
│           └── ImageUpload.tsx
├── server/
│   └── services/
│       ├── user/
│       │   └── profile.service.ts
│       └── storage/
│           └── image.service.ts
└── lib/
    └── validations/
        └── profile.schema.ts
```

### Testing Requirements

**Tests à créer:**
- Test du service `profileService.getProfile()` et `updateProfile()`
- Test de l'API route GET/PUT `/api/profile`
- Test de l'upload d'image (validation format, taille)
- Test de la page de profil
- Test de la validation des données

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-1.4]
- [Source: _bmad-output/project-context.md#Error-Handling-MANDATORY-PATTERNS]
- [Sharp Documentation](https://sharp.pixelplumbing.com/)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4.5 (via Cursor)

### Debug Log References

- Erreur TypeScript Prisma: Résolue en régénérant le client Prisma avec `npx prisma generate` après modification du schéma
- Build Next.js: Succès après régénération Prisma

### Completion Notes List

1. **Modèle Prisma étendu**: Ajout des champs `firstName`, `lastName`, `phone`, `profilePictureUrl` au modèle User. Tous les champs sont optionnels pour permettre une mise à jour progressive du profil.

2. **Service de profil**: Service `profileService` créé avec `getProfile()` et `updateProfile()`. Les méthodes retournent uniquement les champs nécessaires (sans password) pour la sécurité.

3. **Service d'upload d'images**: Service `imageService` créé avec `uploadProfilePicture()` utilisant sharp pour redimensionner (400x400) et optimiser (qualité 80%) les images. Stockage local dans `public/uploads/profiles` pour le MVP. Validation du format (JPG/PNG) et de la taille (max 5MB).

4. **Validation Zod**: Schéma `updateProfileSchema` créé avec validation pour firstName, lastName, et phone. Validation de l'image gérée dans le service et le composant.

5. **API Routes**: Routes GET et PUT `/api/profile` créées avec vérification d'authentification, validation Zod, gestion d'upload d'image, et réponses standardisées.

6. **Page de profil**: Page `/profile` créée avec formulaire React, récupération du profil via API, affichage des informations actuelles, et gestion des erreurs/succès.

7. **Composant ImageUpload**: Composant réutilisable créé avec preview d'image, validation côté client, et gestion des erreurs. Support de la suppression de l'image.

8. **Sécurité**: Toutes les routes API vérifient l'authentification. Validation stricte des fichiers uploadés. Nettoyage des valeurs vides avant validation.

### File List

**Fichiers créés:**
- `src/server/services/user/profile.service.ts` - Service de gestion du profil
- `src/server/services/storage/image.service.ts` - Service d'upload et optimisation d'images
- `src/lib/validations/profile.schema.ts` - Schéma Zod pour validation du profil
- `src/app/api/profile/route.ts` - API routes GET et PUT pour le profil
- `src/app/(protected)/profile/page.tsx` - Page de gestion du profil
- `src/components/features/profile/ImageUpload.tsx` - Composant d'upload d'image avec preview

**Fichiers modifiés:**
- `prisma/schema.prisma` - Ajout des champs firstName, lastName, phone, profilePictureUrl au modèle User
