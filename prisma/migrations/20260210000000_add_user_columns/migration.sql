-- AlterEnum: Add 'support' to UserType enum
ALTER TYPE "UserType" ADD VALUE IF NOT EXISTS 'support';

-- AlterTable: Add missing columns to users table
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "firstName" TEXT,
ADD COLUMN IF NOT EXISTS "lastName" TEXT,
ADD COLUMN IF NOT EXISTS "phone" TEXT,
ADD COLUMN IF NOT EXISTS "profilePictureUrl" TEXT,
ADD COLUMN IF NOT EXISTS "vibesPreferences" JSONB,
ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
