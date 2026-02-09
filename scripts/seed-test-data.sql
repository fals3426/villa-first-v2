-- Script SQL pour créer des données de test
-- À exécuter via Prisma Studio ou psql après avoir créé les utilisateurs via l'interface

-- Note: Les IDs sont des exemples. En production, utilisez des CUIDs générés automatiquement.
-- Ce script suppose que vous avez déjà créé des utilisateurs via l'interface.

-- 1. Créer des listings de test avec coordonnées géographiques

-- Listing 1: Villa à Canggu (vérifiée)
INSERT INTO "listings" (
  "id", "hostId", "title", "description", "location", 
  "latitude", "longitude", "capacity", "pricePerPlace", 
  "status", "completenessScore", "createdAt", "updatedAt"
) VALUES (
  'clx1234567890abcdefghij', -- Remplacez par un vrai CUID
  (SELECT id FROM users WHERE email = 'host@test.com' LIMIT 1),
  'Villa moderne à Canggu',
  'Superbe villa avec piscine, proche de la plage. Parfait pour les digital nomads.',
  'Canggu, Bali',
  -8.6451,  -- Latitude Canggu
  115.1383, -- Longitude Canggu
  4,
  800,
  'published',
  85,
  NOW(),
  NOW()
);

-- Listing 2: Colocation à Ubud (non vérifiée)
INSERT INTO "listings" (
  "id", "hostId", "title", "description", "location", 
  "latitude", "longitude", "capacity", "pricePerPlace", 
  "status", "completenessScore", "createdAt", "updatedAt"
) VALUES (
  'clx2345678901bcdefghijk',
  (SELECT id FROM users WHERE email = 'host@test.com' LIMIT 1),
  'Colocation zen à Ubud',
  'Maison traditionnelle balinaise dans un environnement calme et spirituel.',
  'Ubud, Bali',
  -8.5069,  -- Latitude Ubud
  115.2625, -- Longitude Ubud
  3,
  600,
  'published',
  75,
  NOW(),
  NOW()
);

-- Listing 3: Appartement à Seminyak (vérifiée, prix élevé)
INSERT INTO "listings" (
  "id", "hostId", "title", "description", "location", 
  "latitude", "longitude", "capacity", "pricePerPlace", 
  "status", "completenessScore", "createdAt", "updatedAt"
) VALUES (
  'clx3456789012cdefghijkl',
  (SELECT id FROM users WHERE email = 'host@test.com' LIMIT 1),
  'Appartement moderne Seminyak',
  'Appartement luxueux avec vue sur mer, proche des restaurants et bars.',
  'Seminyak, Bali',
  -8.6874,  -- Latitude Seminyak
  115.1702, -- Longitude Seminyak
  2,
  1200,
  'published',
  90,
  NOW(),
  NOW()
);

-- Listing 4: Maison à Sanur (prix bas)
INSERT INTO "listings" (
  "id", "hostId", "title", "description", "location", 
  "latitude", "longitude", "capacity", "pricePerPlace", 
  "status", "completenessScore", "createdAt", "updatedAt"
) VALUES (
  'clx4567890123defghijklm',
  (SELECT id FROM users WHERE email = 'host@test.com' LIMIT 1),
  'Maison économique à Sanur',
  'Maison simple et abordable, parfaite pour les budgets serrés.',
  'Sanur, Bali',
  -8.6903,  -- Latitude Sanur
  115.2620, -- Longitude Sanur
  5,
  400,
  'published',
  70,
  NOW(),
  NOW()
);

-- 2. Ajouter des règles avec vibes pour chaque listing

-- Listing 1: Vibes "calm" et "social"
UPDATE "listings" 
SET "rules" = '{"vibes": ["calm", "social"], "quietHours": "22:00-08:00", "noSmoking": true}'::jsonb
WHERE "id" = 'clx1234567890abcdefghij';

-- Listing 2: Vibes "spiritual" et "calm"
UPDATE "listings" 
SET "rules" = '{"vibes": ["spiritual", "calm"], "meditationSpace": true, "vegetarianFriendly": true}'::jsonb
WHERE "id" = 'clx2345678901bcdefghijk';

-- Listing 3: Vibes "social" et "remote"
UPDATE "listings" 
SET "rules" = '{"vibes": ["social", "remote"], "wifiSpeed": "100Mbps", "coWorkingSpace": true}'::jsonb
WHERE "id" = 'clx3456789012cdefghijkl';

-- Listing 4: Vibes "calm" uniquement
UPDATE "listings" 
SET "rules" = '{"vibes": ["calm"], "familyFriendly": true}'::jsonb
WHERE "id" = 'clx4567890123defghijklm';

-- 3. Ajouter des photos (exemples avec URLs placeholder)

-- Photo principale pour Listing 1
INSERT INTO "ListingPhoto" (
  "id", "listingId", "url", "category", "position", "createdAt"
) VALUES (
  'clxphoto1',
  'clx1234567890abcdefghij',
  '/placeholder-villa-canggu.jpg',
  'OTHER',
  0,
  NOW()
);

-- Photo principale pour Listing 2
INSERT INTO "ListingPhoto" (
  "id", "listingId", "url", "category", "position", "createdAt"
) VALUES (
  'clxphoto2',
  'clx2345678901bcdefghijk',
  '/placeholder-ubud.jpg',
  'OTHER',
  0,
  NOW()
);

-- Photo principale pour Listing 3
INSERT INTO "ListingPhoto" (
  "id", "listingId", "url", "category", "position", "createdAt"
) VALUES (
  'clxphoto3',
  'clx3456789012cdefghijkl',
  '/placeholder-seminyak.jpg',
  'OTHER',
  0,
  NOW()
);

-- Photo principale pour Listing 4
INSERT INTO "ListingPhoto" (
  "id", "listingId", "url", "category", "position", "createdAt"
) VALUES (
  'clxphoto4',
  'clx4567890123defghijklm',
  '/placeholder-sanur.jpg',
  'OTHER',
  0,
  NOW()
);

-- 4. Créer une demande de vérification pour Listing 1 (pour avoir une annonce vérifiée)

-- D'abord, créer une demande de vérification
INSERT INTO "VerificationRequest" (
  "id", "listingId", "status", "createdAt", "updatedAt"
) VALUES (
  'clxverif1',
  'clx1234567890abcdefghij',
  'approved',
  NOW(),
  NOW()
);

-- 5. Créer des slots de disponibilité (optionnel, pour tester le calendrier)

-- Slot disponible pour Listing 1 (février 2026)
INSERT INTO "AvailabilitySlot" (
  "id", "listingId", "startDate", "endDate", "isAvailable", "createdAt", "updatedAt"
) VALUES (
  'clxslot1',
  'clx1234567890abcdefghij',
  '2026-02-01',
  '2026-02-28',
  true,
  NOW(),
  NOW()
);

-- Slot disponible pour Listing 2 (mars 2026)
INSERT INTO "AvailabilitySlot" (
  "id", "listingId", "startDate", "endDate", "isAvailable", "createdAt", "updatedAt"
) VALUES (
  'clxslot2',
  'clx2345678901bcdefghijk',
  '2026-03-01',
  '2026-03-31',
  true,
  NOW(),
  NOW()
);

-- Instructions d'utilisation:
-- 1. Remplacez les IDs par de vrais CUIDs (générés par Prisma)
-- 2. Assurez-vous que les utilisateurs existent (créés via l'interface)
-- 3. Exécutez ce script via Prisma Studio ou psql
-- 4. OU utilisez l'interface pour créer les listings manuellement
