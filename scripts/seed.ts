/**
 * Script de seed pour générer des données de test
 * 
 * Usage:
 *   npm run seed
 *   (ou directement: node scripts/seed-wrapper.js)
 * 
 * Ce script crée:
 * - Des utilisateurs hôtes avec KYC vérifié
 * - Des villas complètes avec photos, disponibilités, règles, etc.
 * - Des instructions de check-in
 * - Optionnellement des réservations de test
 * 
 * NOTE: Les variables d'environnement sont chargées par seed-wrapper.js
 * avant l'exécution de ce script.
 */

import { PrismaClient, UserType, ListingType, ListingStatus, PhotoCategory, KycStatus } from '@prisma/client';
import { hash } from 'bcryptjs';
import { prisma } from '../src/lib/prisma';
import { completenessService } from '../src/server/services/listings/completeness.service';

// Images placeholder de haute qualité (Unsplash)
const PLACEHOLDER_IMAGES = {
  kitchen: [
    'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&h=600&fit=crop',
  ],
  bedroom: [
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop',
  ],
  bathroom: [
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop',
  ],
  outdoor: [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&h=600&fit=crop',
  ],
  other: [
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800&h=600&fit=crop',
  ],
};

// Données de villas de test
const VILLAS_DATA = [
  {
    title: 'Villa moderne à Canggu avec piscine',
    description: 'Superbe villa moderne de 4 chambres avec piscine privée, située à seulement 5 minutes à pied de la plage de Canggu. Parfait pour les digital nomads qui cherchent un espace de vie confortable et inspirant. La villa dispose d\'un espace de coworking, d\'une cuisine équipée, et d\'un jardin tropical magnifique.',
    address: 'Jl. Pantai Batu Bolong, Canggu, Badung Regency, Bali 80351, Indonésie',
    location: 'Canggu, Bali',
    latitude: -8.6451,
    longitude: 115.1383,
    capacity: 4,
    pricePerPlace: 800,
    listingType: ListingType.VILLA,
    rules: {
      noSmoking: true,
      noPets: false,
      quietHours: '22:00-08:00',
      cleaning: 'Chaque locataire nettoie après utilisation',
      sharedSpaces: 'Cuisine et salon partagés',
    },
    charter: 'Nous sommes une communauté de digital nomads respectueux et ouverts. Nous valorisons la communication, le respect mutuel et l\'entraide. Chacun contribue à maintenir un environnement positif et productif.',
    validationRule: 'FULL_ONLY' as const,
    validationThreshold: 4,
  },
  {
    title: 'Colocation zen à Ubud dans maison traditionnelle',
    description: 'Maison traditionnelle balinaise authentique dans un environnement calme et spirituel à Ubud. Idéale pour ceux qui cherchent la tranquillité et l\'inspiration. La maison dispose de 3 chambres spacieuses, d\'un jardin méditatif, et d\'une terrasse avec vue sur les rizières. Proche des temples et des cours de yoga.',
    address: 'Jl. Raya Ubud, Ubud, Gianyar Regency, Bali 80571, Indonésie',
    location: 'Ubud, Bali',
    latitude: -8.5069,
    longitude: 115.2625,
    capacity: 3,
    pricePerPlace: 600,
    listingType: ListingType.VILLA,
    rules: {
      noSmoking: true,
      noPets: true,
      quietHours: '21:00-07:00',
      cleaning: 'Rotation hebdomadaire des tâches ménagères',
      sharedSpaces: 'Tous les espaces sont partagés',
      meditation: 'Respecter les moments de méditation',
    },
    charter: 'Notre communauté valorise la paix intérieure, le respect de la culture balinaise, et la connexion avec la nature. Nous encourageons la pratique du yoga, de la méditation et des activités spirituelles.',
    validationRule: 'PARTIAL' as const,
    validationThreshold: 2,
  },
  {
    title: 'Appartement moderne à Seminyak centre-ville',
    description: 'Appartement moderne et élégant au cœur de Seminyak, à proximité des meilleurs restaurants, cafés et boutiques. Parfait pour ceux qui aiment être au centre de l\'action. L\'appartement dispose de 2 chambres, d\'un salon moderne, d\'une cuisine équipée, et d\'un balcon avec vue sur la ville.',
    address: 'Jl. Kayu Aya, Seminyak, Kuta, Badung Regency, Bali 80361, Indonésie',
    location: 'Seminyak, Bali',
    latitude: -8.6844,
    longitude: 115.1700,
    capacity: 2,
    pricePerPlace: 1200,
    listingType: ListingType.ROOM,
    rules: {
      noSmoking: true,
      noPets: true,
      quietHours: '23:00-09:00',
      cleaning: 'Service de ménage hebdomadaire inclus',
      sharedSpaces: 'Salon et cuisine partagés',
      guests: 'Pas de visiteurs après 22h',
    },
    charter: 'Nous sommes une communauté urbaine dynamique qui apprécie l\'équilibre entre vie sociale et productivité. Nous respectons l\'espace de chacun tout en favorisant les échanges et les sorties communes.',
    validationRule: 'MANUAL' as const,
    validationThreshold: null,
  },
  {
    title: 'Villa de luxe à Sanur avec vue sur mer',
    description: 'Magnifique villa de luxe avec vue panoramique sur l\'océan à Sanur. Cette villa exceptionnelle dispose de 5 chambres, d\'une piscine à débordement, d\'un jardin tropical luxuriant, et d\'un accès direct à la plage. Parfait pour ceux qui recherchent le confort et la tranquillité.',
    address: 'Jl. Danau Tamblingan, Sanur, Denpasar Selatan, Denpasar, Bali 80228, Indonésie',
    location: 'Sanur, Bali',
    latitude: -8.6905,
    longitude: 115.2620,
    capacity: 5,
    pricePerPlace: 1500,
    listingType: ListingType.VILLA,
    rules: {
      noSmoking: true,
      noPets: false,
      quietHours: '22:00-08:00',
      cleaning: 'Service de ménage quotidien inclus',
      sharedSpaces: 'Tous les espaces sont partagés',
      pool: 'Piscine accessible 24/7',
      beach: 'Accès plage privé',
    },
    charter: 'Notre communauté de luxe valorise l\'excellence, le respect mutuel et les expériences mémorables. Nous organisons régulièrement des événements communautaires et des activités de groupe.',
    validationRule: 'FULL_ONLY' as const,
    validationThreshold: 5,
  },
  {
    title: 'Colocation économique à Denpasar',
    description: 'Colocation économique et conviviale dans le centre de Denpasar. Parfaite pour les budgets serrés qui cherchent une communauté accueillante. La maison dispose de 4 chambres simples mais confortables, d\'une cuisine commune, et d\'un petit jardin. Proche des transports en commun et des commodités.',
    address: 'Jl. Gajah Mada, Denpasar, Bali 80232, Indonésie',
    location: 'Denpasar, Bali',
    latitude: -8.6705,
    longitude: 115.2126,
    capacity: 4,
    pricePerPlace: 400,
    listingType: ListingType.SHARED_ROOM,
    rules: {
      noSmoking: true,
      noPets: true,
      quietHours: '23:00-07:00',
      cleaning: 'Chacun nettoie après utilisation',
      sharedSpaces: 'Tous les espaces sont partagés',
      budget: 'Économies d\'énergie et d\'eau importantes',
    },
    charter: 'Notre communauté économique valorise l\'entraide, le partage des ressources et la solidarité. Nous organisons des repas communs et des activités gratuites pour créer des liens.',
    validationRule: 'PARTIAL' as const,
    validationThreshold: 2,
  },
];

async function main() {
  // Vérifier que DATABASE_URL est définie
  if (!process.env.DATABASE_URL) {
    console.error('\n❌ ERREUR : DATABASE_URL n\'est pas définie !\n');
    console.error('📝 Pour résoudre ce problème :\n');
    console.error('   1. Créez ou vérifiez le fichier .env.local à la racine du projet');
    console.error('   2. Ajoutez la ligne suivante dans .env.local :');
    console.error('      DATABASE_URL="postgresql://user:password@localhost:5432/villa_first_v2"\n');
    console.error('   📍 Emplacement attendu :');
    console.error(`      ${process.cwd()}\\.env.local\n`);
    console.error('💡 Exemple complet de .env.local :');
    console.error('   DATABASE_URL="postgresql://postgres:monmotdepasse@localhost:5432/villa_first_v2"');
    console.error('   NEXTAUTH_SECRET="votre-secret-ici"');
    console.error('   NEXTAUTH_URL="http://localhost:3000"\n');
    console.error('⚠️  Remplacez :');
    console.error('   - postgres : votre utilisateur PostgreSQL');
    console.error('   - monmotdepasse : votre mot de passe PostgreSQL');
    console.error('   - localhost:5432 : votre host et port PostgreSQL');
    console.error('   - villa_first_v2 : le nom de votre base de données\n');
    process.exit(1);
  }

  console.log('✅ DATABASE_URL trouvée');
  console.log('🌱 Démarrage du seed de la base de données...\n');

  // Nettoyer les données existantes (optionnel - commenté pour sécurité)
  // console.log('⚠️  Nettoyage des données existantes...');
  // await prisma.booking.deleteMany();
  // await prisma.checkIn.deleteMany();
  // await prisma.incident.deleteMany();
  // await prisma.payment.deleteMany();
  // await prisma.chat.deleteMany();
  // await prisma.message.deleteMany();
  // await prisma.watchedListing.deleteMany();
  // await prisma.listingPhoto.deleteMany();
  // await prisma.availabilitySlot.deleteMany();
  // await prisma.checkInInstruction.deleteMany();
  // await prisma.verificationDocument.deleteMany();
  // await prisma.verificationRequest.deleteMany();
  // await prisma.listing.deleteMany();
  // await prisma.kycVerification.deleteMany();
  // await prisma.notificationPreferences.deleteMany();
  // await prisma.pushSubscription.deleteMany();
  // await prisma.user.deleteMany();

  // Créer ou récupérer des utilisateurs hôtes
  console.log('👤 Création des utilisateurs hôtes...');
  const hosts = [];
  const hostEmails = [
    'host1@test.com',
    'host2@test.com',
    'host3@test.com',
    'host4@test.com',
    'host5@test.com',
  ];

  for (let i = 0; i < hostEmails.length; i++) {
    const email = hostEmails[i];
    let host = await prisma.user.findUnique({
      where: { email },
    });

    if (!host) {
      const hashedPassword = await hash('Test1234!', 12);
      host = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          userType: UserType.host,
          firstName: `Host${i + 1}`,
          lastName: 'Test',
          phone: `+6281234567${i}`,
          onboardingCompleted: true,
        },
      });
      console.log(`  ✅ Créé: ${email}`);
    } else {
      console.log(`  ℹ️  Existant: ${email}`);
    }

    // Créer ou mettre à jour le KYC pour chaque hôte
    const kyc = await prisma.kycVerification.findUnique({
      where: { userId: host.id },
    });

    if (!kyc) {
      await prisma.kycVerification.create({
        data: {
          userId: host.id,
          documentUrl: 'https://example.com/kyc-document.pdf',
          status: KycStatus.verified,
          provider: 'manual',
          verifiedName: `${host.firstName} ${host.lastName}`,
          verifiedDateOfBirth: new Date('1990-01-01'),
          verifiedNationality: 'French',
          verifiedAt: new Date(),
        },
      });
      console.log(`  ✅ KYC vérifié pour ${email}`);
    }

    hosts.push(host);
  }

  // Créer les villas avec toutes leurs données
  console.log('\n🏠 Création des villas...');
  const listings = [];

  for (let i = 0; i < VILLAS_DATA.length; i++) {
    const villaData = VILLAS_DATA[i];
    const host = hosts[i % hosts.length]; // Distribuer les villas entre les hôtes

    // Créer la villa
    const listing = await prisma.listing.create({
      data: {
        hostId: host.id,
        title: villaData.title,
        description: villaData.description,
        address: villaData.address,
        location: villaData.location,
        latitude: villaData.latitude,
        longitude: villaData.longitude,
        capacity: villaData.capacity,
        listingType: villaData.listingType,
        status: ListingStatus.published,
        pricePerPlace: villaData.pricePerPlace,
        rules: villaData.rules,
        charter: villaData.charter,
        validationRule: villaData.validationRule,
        validationThreshold: villaData.validationThreshold,
        completenessScore: 0, // Sera recalculé après l'ajout des photos
      },
    });

    console.log(`  ✅ Créé: ${listing.title}`);

    // Ajouter les photos par catégorie
    console.log(`    📸 Ajout des photos...`);
    const photoCategories = [
      { category: PhotoCategory.KITCHEN, images: PLACEHOLDER_IMAGES.kitchen },
      { category: PhotoCategory.BEDROOM, images: PLACEHOLDER_IMAGES.bedroom },
      { category: PhotoCategory.BATHROOM, images: PLACEHOLDER_IMAGES.bathroom },
      { category: PhotoCategory.OUTDOOR, images: PLACEHOLDER_IMAGES.outdoor },
    ];

    for (const { category, images } of photoCategories) {
      // Ajouter 2-3 photos par catégorie
      const numPhotos = Math.floor(Math.random() * 2) + 2; // 2 ou 3 photos
      for (let j = 0; j < numPhotos && j < images.length; j++) {
        await prisma.listingPhoto.create({
          data: {
            listingId: listing.id,
            category,
            url: images[j],
            originalUrl: images[j],
            position: j,
          },
        });
      }
    }

    // Ajouter quelques photos "OTHER"
    for (let j = 0; j < 2 && j < PLACEHOLDER_IMAGES.other.length; j++) {
      await prisma.listingPhoto.create({
        data: {
          listingId: listing.id,
          category: PhotoCategory.OTHER,
          url: PLACEHOLDER_IMAGES.other[j],
          originalUrl: PLACEHOLDER_IMAGES.other[j],
          position: j,
        },
      });
    }

    // Créer des créneaux de disponibilité pour les 3 prochains mois
    console.log(`    📅 Création des créneaux de disponibilité...`);
    const today = new Date();
    const months = 3;
    const slots = [];

    for (let month = 0; month < months; month++) {
      const startDate = new Date(today);
      startDate.setMonth(today.getMonth() + month);
      startDate.setDate(1); // Premier jour du mois

      const endDate = new Date(startDate);
      endDate.setMonth(startDate.getMonth() + 1);
      endDate.setDate(0); // Dernier jour du mois

      // Créer quelques créneaux par mois (certains disponibles, certains non)
      const numSlots = Math.floor(Math.random() * 3) + 2; // 2-4 créneaux par mois
      for (let j = 0; j < numSlots; j++) {
        const slotStart = new Date(startDate);
        slotStart.setDate(1 + j * 7); // Début de semaine

        const slotEnd = new Date(slotStart);
        slotEnd.setDate(slotStart.getDate() + 7); // Une semaine

        if (slotEnd <= endDate) {
          slots.push({
            listingId: listing.id,
            startDate: slotStart,
            endDate: slotEnd,
            isAvailable: Math.random() > 0.3, // 70% de disponibilité
          });
        }
      }
    }

    // Créer les créneaux en batch
    if (slots.length > 0) {
      await prisma.availabilitySlot.createMany({
        data: slots,
      });
      console.log(`    ✅ ${slots.length} créneaux créés`);
    }

    // Créer les instructions de check-in
    console.log(`    🗝️  Création des instructions de check-in...`);
    await prisma.checkInInstruction.create({
      data: {
        listingId: listing.id,
        address: villaData.address,
        accessCodes: {
          mainDoor: `CODE${i + 1}${Math.floor(Math.random() * 1000)}`,
          wifi: `WIFI${i + 1}`,
          wifiPassword: `password${i + 1}`,
        },
        hostPhone: host.phone || `+6281234567${i}`,
        hostEmail: host.email,
        instructions: `Bienvenue ! Le code d'accès principal est disponible ci-dessus. En cas de problème, contactez ${host.firstName} au ${host.phone || 'numéro fourni'}. Profitez de votre séjour !`,
      },
    });

    // Recalculer le score de complétude
    await completenessService.recalculateAndPersistCompleteness(listing.id);

    // Recharger la listing avec le score mis à jour
    const updatedListing = await prisma.listing.findUnique({
      where: { id: listing.id },
    });

    listings.push(updatedListing!);
    console.log(`    ✅ Score de complétude: ${updatedListing?.completenessScore}%\n`);
  }

  console.log(`\n✅ Seed terminé avec succès !`);
  console.log(`\n📊 Résumé:`);
  console.log(`   - ${hosts.length} utilisateurs hôtes créés`);
  console.log(`   - ${listings.length} villas créées`);
  console.log(`   - Toutes les villas ont des photos, disponibilités et instructions de check-in`);
  console.log(`\n🔑 Comptes de test:`);
  hostEmails.forEach((email, i) => {
    console.log(`   ${i + 1}. ${email} / Test1234!`);
  });
  console.log(`\n💡 Vous pouvez maintenant tester l'application avec ces données !`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
