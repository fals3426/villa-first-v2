import { z } from 'zod';
import { PhotoCategory } from '@prisma/client';

/**
 * Schéma de validation pour l'upload de photos (Story 3.2)
 */
export const addPhotosSchema = z.object({
  category: z.nativeEnum(PhotoCategory, {
    message: 'Catégorie de photo invalide',
  }),
});

export const reorderPhotosSchema = z.object({
  updates: z.array(
    z.object({
      photoId: z.string().min(1, 'ID de photo requis'),
      position: z.number().int().min(0, 'Position doit être positive'),
    })
  ).min(1, 'Au moins une photo doit être mise à jour'),
});
