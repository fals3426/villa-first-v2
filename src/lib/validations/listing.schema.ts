import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().min(10, 'Le titre doit contenir au moins 10 caractères'),
  description: z.string().min(50, 'La description doit contenir au moins 50 caractères'),
  address: z.string().min(5, 'L\'adresse est requise'),
  location: z.string().optional(),
  capacity: z.number().int().positive('Le nombre de places doit être positif'),
  listingType: z.enum(['VILLA', 'ROOM', 'SHARED_ROOM'], {
    message: 'Type d\'annonce invalide',
  }),
});

export const updateListingSchema = z.object({
  title: z.string().min(10).optional(),
  description: z.string().min(50).optional(),
  address: z.string().min(5).optional(),
  location: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  listingType: z.enum(['VILLA', 'ROOM', 'SHARED_ROOM']).optional(),
  pricePerPlace: z.number().positive().optional(),
  rules: z.record(z.string(), z.unknown()).optional(),
  charter: z.string().optional(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
