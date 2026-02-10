-- CreateEnum (only enums that don't exist yet)
CREATE TYPE IF NOT EXISTS "KycStatus" AS ENUM ('pending', 'verified', 'rejected');

CREATE TYPE IF NOT EXISTS "VerificationStatus" AS ENUM ('pending', 'in_review', 'approved', 'rejected', 'suspended', 'revoked');

CREATE TYPE IF NOT EXISTS "ListingStatus" AS ENUM ('draft', 'published', 'suspended');

CREATE TYPE IF NOT EXISTS "ListingType" AS ENUM ('VILLA', 'ROOM', 'SHARED_ROOM');

CREATE TYPE IF NOT EXISTS "PhotoCategory" AS ENUM ('KITCHEN', 'BEDROOM', 'BATHROOM', 'OUTDOOR', 'OTHER');

CREATE TYPE IF NOT EXISTS "BookingStatus" AS ENUM ('pending', 'confirmed', 'expired', 'cancelled', 'price_changed', 'accepted', 'rejected', 'incident_reported');

CREATE TYPE IF NOT EXISTS "PaymentStatus" AS ENUM ('pending', 'captured', 'expired', 'cancelled', 'failed', 'refunded');

CREATE TYPE IF NOT EXISTS "ValidationRule" AS ENUM ('FULL_ONLY', 'PARTIAL', 'MANUAL');

CREATE TYPE IF NOT EXISTS "IncidentType" AS ENUM ('CODE_NOT_WORKING', 'PLACE_DIFFERENT', 'ACCESS_ISSUE', 'OTHER');

CREATE TYPE IF NOT EXISTS "IncidentStatus" AS ENUM ('reported', 'in_progress', 'resolved', 'closed');

-- CreateTable
CREATE TABLE IF NOT EXISTS "verification_requests" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "verification_documents" (
    "id" TEXT NOT NULL,
    "verificationRequestId" TEXT NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "originalFileName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "kyc_verifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "documentUrl" TEXT NOT NULL,
    "status" "KycStatus" NOT NULL DEFAULT 'pending',
    "provider" TEXT NOT NULL,
    "providerId" TEXT,
    "verifiedName" TEXT,
    "verifiedDateOfBirth" TIMESTAMP(3),
    "verifiedNationality" TEXT,
    "retentionUntil" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kyc_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "chats" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "notification_preferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT false,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT false,
    "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "notifyNewBooking" BOOLEAN NOT NULL DEFAULT true,
    "notifyNewMessage" BOOLEAN NOT NULL DEFAULT true,
    "notifyValidation" BOOLEAN NOT NULL DEFAULT true,
    "notifyCheckInIssue" BOOLEAN NOT NULL DEFAULT true,
    "notifyMatchingListing" BOOLEAN NOT NULL DEFAULT true,
    "notifyPlaceAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "push_subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "keys" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "watched_listings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notifiedAt" TIMESTAMP(3),

    CONSTRAINT "watched_listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "listings" (
    "id" TEXT NOT NULL,
    "hostId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "capacity" INTEGER NOT NULL,
    "listingType" "ListingType" NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'draft',
    "pricePerPlace" DOUBLE PRECISION,
    "rules" JSONB,
    "charter" TEXT,
    "completenessScore" INTEGER DEFAULT 0,
    "videoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "validationRule" "ValidationRule",
    "validationThreshold" INTEGER,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "listing_photos" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "category" "PhotoCategory" NOT NULL,
    "url" TEXT NOT NULL,
    "originalUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "availability_slots" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "availability_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "bookings" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "currentListingPrice" INTEGER,
    "priceAtBooking" INTEGER,
    "rejectionReason" TEXT,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "check_ins" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "distanceFromListing" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "incidents" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "type" "IncidentType" NOT NULL,
    "description" TEXT NOT NULL,
    "photos" JSONB,
    "status" "IncidentStatus" NOT NULL DEFAULT 'reported',
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "isUrgent" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "check_in_instructions" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "accessCodes" JSONB,
    "hostPhone" TEXT,
    "hostEmail" TEXT,
    "instructions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "check_in_instructions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "payments" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "verification_requests_hostId_idx" ON "verification_requests"("hostId");
CREATE INDEX IF NOT EXISTS "verification_requests_listingId_idx" ON "verification_requests"("listingId");
CREATE INDEX IF NOT EXISTS "verification_requests_status_idx" ON "verification_requests"("status");
CREATE INDEX IF NOT EXISTS "verification_documents_verificationRequestId_idx" ON "verification_documents"("verificationRequestId");
CREATE UNIQUE INDEX IF NOT EXISTS "kyc_verifications_userId_key" ON "kyc_verifications"("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_userId_idx" ON "audit_logs"("userId");
CREATE INDEX IF NOT EXISTS "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");
CREATE INDEX IF NOT EXISTS "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");
CREATE INDEX IF NOT EXISTS "chats_listingId_idx" ON "chats"("listingId");
CREATE INDEX IF NOT EXISTS "chats_tenantId_idx" ON "chats"("tenantId");
CREATE INDEX IF NOT EXISTS "chats_hostId_idx" ON "chats"("hostId");
CREATE INDEX IF NOT EXISTS "chats_updatedAt_idx" ON "chats"("updatedAt");
CREATE UNIQUE INDEX IF NOT EXISTS "chats_listingId_tenantId_hostId_key" ON "chats"("listingId", "tenantId", "hostId");
CREATE INDEX IF NOT EXISTS "messages_chatId_idx" ON "messages"("chatId");
CREATE INDEX IF NOT EXISTS "messages_senderId_idx" ON "messages"("senderId");
CREATE INDEX IF NOT EXISTS "messages_createdAt_idx" ON "messages"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "notification_preferences_userId_key" ON "notification_preferences"("userId");
CREATE INDEX IF NOT EXISTS "push_subscriptions_userId_idx" ON "push_subscriptions"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "push_subscriptions_userId_endpoint_key" ON "push_subscriptions"("userId", "endpoint");
CREATE INDEX IF NOT EXISTS "watched_listings_userId_idx" ON "watched_listings"("userId");
CREATE INDEX IF NOT EXISTS "watched_listings_listingId_idx" ON "watched_listings"("listingId");
CREATE UNIQUE INDEX IF NOT EXISTS "watched_listings_userId_listingId_key" ON "watched_listings"("userId", "listingId");
CREATE INDEX IF NOT EXISTS "listings_hostId_idx" ON "listings"("hostId");
CREATE INDEX IF NOT EXISTS "listings_status_idx" ON "listings"("status");
CREATE INDEX IF NOT EXISTS "listings_location_idx" ON "listings"("location");
CREATE INDEX IF NOT EXISTS "listings_pricePerPlace_idx" ON "listings"("pricePerPlace");
CREATE INDEX IF NOT EXISTS "listings_latitude_longitude_idx" ON "listings"("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "listing_photos_listingId_idx" ON "listing_photos"("listingId");
CREATE INDEX IF NOT EXISTS "listing_photos_listingId_category_idx" ON "listing_photos"("listingId", "category");
CREATE INDEX IF NOT EXISTS "availability_slots_listingId_idx" ON "availability_slots"("listingId");
CREATE INDEX IF NOT EXISTS "availability_slots_listingId_startDate_endDate_idx" ON "availability_slots"("listingId", "startDate", "endDate");
CREATE INDEX IF NOT EXISTS "bookings_listingId_idx" ON "bookings"("listingId");
CREATE INDEX IF NOT EXISTS "bookings_tenantId_idx" ON "bookings"("tenantId");
CREATE INDEX IF NOT EXISTS "bookings_status_idx" ON "bookings"("status");
CREATE INDEX IF NOT EXISTS "bookings_checkIn_checkOut_idx" ON "bookings"("checkIn", "checkOut");
CREATE INDEX IF NOT EXISTS "check_ins_bookingId_idx" ON "check_ins"("bookingId");
CREATE INDEX IF NOT EXISTS "check_ins_createdAt_idx" ON "check_ins"("createdAt");
CREATE INDEX IF NOT EXISTS "incidents_bookingId_idx" ON "incidents"("bookingId");
CREATE INDEX IF NOT EXISTS "incidents_status_idx" ON "incidents"("status");
CREATE INDEX IF NOT EXISTS "incidents_isUrgent_createdAt_idx" ON "incidents"("isUrgent", "createdAt");
CREATE INDEX IF NOT EXISTS "incidents_createdAt_idx" ON "incidents"("createdAt");
CREATE UNIQUE INDEX IF NOT EXISTS "check_in_instructions_listingId_key" ON "check_in_instructions"("listingId");
CREATE UNIQUE INDEX IF NOT EXISTS "payments_stripePaymentIntentId_key" ON "payments"("stripePaymentIntentId");
CREATE INDEX IF NOT EXISTS "payments_bookingId_idx" ON "payments"("bookingId");
CREATE INDEX IF NOT EXISTS "payments_status_idx" ON "payments"("status");
CREATE INDEX IF NOT EXISTS "payments_stripePaymentIntentId_idx" ON "payments"("stripePaymentIntentId");
CREATE INDEX IF NOT EXISTS "payments_expiresAt_idx" ON "payments"("expiresAt");

-- AddForeignKey
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "verification_requests" ADD CONSTRAINT "verification_requests_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_verificationRequestId_fkey" FOREIGN KEY ("verificationRequestId") REFERENCES "verification_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "kyc_verifications" ADD CONSTRAINT "kyc_verifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chats" ADD CONSTRAINT "chats_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chats" ADD CONSTRAINT "chats_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "chats" ADD CONSTRAINT "chats_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "chats"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "watched_listings" ADD CONSTRAINT "watched_listings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "watched_listings" ADD CONSTRAINT "watched_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listings" ADD CONSTRAINT "listings_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "listing_photos" ADD CONSTRAINT "listing_photos_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "availability_slots" ADD CONSTRAINT "availability_slots_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "check_in_instructions" ADD CONSTRAINT "check_in_instructions_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
