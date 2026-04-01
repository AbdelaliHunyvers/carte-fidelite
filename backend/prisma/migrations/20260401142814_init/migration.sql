-- CreateEnum
CREATE TYPE "LoyaltyType" AS ENUM ('STAMPS', 'POINTS');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('STAMP_ADD', 'POINTS_ADD', 'REWARD_CLAIMED');

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "logo" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyProgram" (
    "id" TEXT NOT NULL,
    "restaurantId" TEXT NOT NULL,
    "type" "LoyaltyType" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "stampGoal" INTEGER,
    "pointsPerEuro" DOUBLE PRECISION,
    "pointsGoal" INTEGER,
    "reward" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#1a1a2e',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoyaltyCard" (
    "id" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "currentStamps" INTEGER NOT NULL DEFAULT 0,
    "currentPoints" INTEGER NOT NULL DEFAULT 0,
    "totalRewardsEarned" INTEGER NOT NULL DEFAULT 0,
    "appleDeviceTokens" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "googlePassObjectId" TEXT,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LoyaltyCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 1,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApplePassRegistration" (
    "id" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "pushToken" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "passTypeId" TEXT NOT NULL,

    CONSTRAINT "ApplePassRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_email_key" ON "Restaurant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyCard_serialNumber_key" ON "LoyaltyCard"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "LoyaltyCard_customerId_programId_key" ON "LoyaltyCard"("customerId", "programId");

-- CreateIndex
CREATE INDEX "ApplePassRegistration_serialNumber_idx" ON "ApplePassRegistration"("serialNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ApplePassRegistration_deviceId_serialNumber_key" ON "ApplePassRegistration"("deviceId", "serialNumber");

-- AddForeignKey
ALTER TABLE "LoyaltyProgram" ADD CONSTRAINT "LoyaltyProgram_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyCard" ADD CONSTRAINT "LoyaltyCard_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoyaltyCard" ADD CONSTRAINT "LoyaltyCard_programId_fkey" FOREIGN KEY ("programId") REFERENCES "LoyaltyProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "LoyaltyCard"("id") ON DELETE CASCADE ON UPDATE CASCADE;
