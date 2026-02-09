import { z } from 'zod';

/**
 * Schéma de validation pour la création d'une réservation (Story 5.1)
 */
export const createBookingSchema = z.object({
  listingId: z.string().cuid('ID d\'annonce invalide'),
  checkIn: z.string().datetime('Date de check-in invalide').transform((str) => new Date(str)),
  checkOut: z.string().datetime('Date de check-out invalide').transform((str) => new Date(str)),
}).refine((data) => {
  return data.checkIn < data.checkOut;
}, {
  message: 'La date de check-in doit être antérieure à la date de check-out',
  path: ['checkOut'],
}).refine((data) => {
  const now = new Date();
  return data.checkIn >= now;
}, {
  message: 'La date de check-in ne peut pas être dans le passé',
  path: ['checkIn'],
});
