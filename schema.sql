-- Avizio Database Schema
-- Generated from Prisma schema

-- Enums
CREATE TYPE "Plan" AS ENUM ('TRIAL', 'ESSENTIAL', 'PRO');
CREATE TYPE "ReviewType" AS ENUM ('GOOGLE', 'PRIVATE');
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'TREATED', 'ARCHIVED');
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'SENDING', 'SENT');
CREATE TYPE "SmsStatus" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'OPENED', 'REVIEWED', 'FAILED');

-- Business (Commerçant)
CREATE TABLE "Business" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "googlePlaceId" TEXT,
    "googleReviewUrl" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'ESSENTIAL',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "smsQuota" INTEGER NOT NULL DEFAULT 100,
    "smsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Business_email_key" ON "Business"("email");

-- Customer (Client du commerçant)
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "businessId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "lastVisit" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Customer_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Customer_businessId_phone_key" ON "Customer"("businessId", "phone");

-- Review (Avis / Feedback)
CREATE TABLE "Review" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "businessId" TEXT NOT NULL,
    "customerId" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "type" "ReviewType" NOT NULL,
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "smsLogId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Review_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- SmsCampaign (Campagnes SMS)
CREATE TABLE "SmsCampaign" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "businessId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "openCount" INTEGER NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SmsCampaign_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SmsCampaign_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- SmsLog (Logs SMS individuels)
CREATE TABLE "SmsLog" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "businessId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "campaignId" TEXT,
    "phone" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "SmsStatus" NOT NULL DEFAULT 'SENT',
    "twilioSid" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    CONSTRAINT "SmsLog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "SmsLog_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SmsLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SmsLog_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "SmsCampaign"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Prisma migrations table
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" TEXT NOT NULL,
    "checksum" TEXT NOT NULL,
    "finished_at" TIMESTAMP(3),
    "migration_name" TEXT NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
);
