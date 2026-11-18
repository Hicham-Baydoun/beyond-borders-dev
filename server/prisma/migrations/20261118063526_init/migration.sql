-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('UNCONFIRMED', 'ACTIVE', 'DEACTIVATED');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('AGENT', 'ADMINISTRATOR');

-- CreateEnum
CREATE TYPE "CatalogStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DepartureStatus" AS ENUM ('OPEN', 'DEPARTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PromotionType" AS ENUM ('SEASONAL_PRICE', 'DISCOUNT');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'EXPIRED', 'CANCELLED', 'REFUNDED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BookingChannel" AS ENUM ('ONLINE', 'AGENT');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('PAYMENT', 'REFUND');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CARD', 'CASH', 'BANK_TRANSFER');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('E_TICKET', 'HOTEL_VOUCHER', 'TRANSFER_VOUCHER', 'OTHER');

-- CreateEnum
CREATE TYPE "TokenPurpose" AS ENUM ('CONFIRM_EMAIL', 'RESET_PASSWORD', 'SET_PASSWORD');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('WAITING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "customer" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneDigits" TEXT NOT NULL,
    "passwordHash" TEXT,
    "status" "AccountStatus" NOT NULL DEFAULT 'UNCONFIRMED',
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdByStaffId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_user" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "role" "StaffRole" NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "failedLoginCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "staff_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_token" (
    "id" SERIAL NOT NULL,
    "purpose" "TokenPurpose" NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "customerId" INTEGER,
    "staffId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "destination" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "CatalogStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo" (
    "id" SERIAL NOT NULL,
    "destinationId" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "package" (
    "id" SERIAL NOT NULL,
    "destinationId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "pricePerPerson" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "includedServices" TEXT NOT NULL,
    "status" "CatalogStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "package_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion" (
    "id" SERIAL NOT NULL,
    "packageId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "type" "PromotionType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,

    CONSTRAINT "promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departure" (
    "id" SERIAL NOT NULL,
    "packageId" INTEGER NOT NULL,
    "departureDate" DATE NOT NULL,
    "returnDate" DATE NOT NULL,
    "totalPlaces" INTEGER NOT NULL,
    "status" "DepartureStatus" NOT NULL DEFAULT 'OPEN',
    "cancelReason" TEXT,

    CONSTRAINT "departure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking" (
    "id" SERIAL NOT NULL,
    "reference" CHAR(6) NOT NULL,
    "customerId" INTEGER NOT NULL,
    "departureId" INTEGER NOT NULL,
    "channel" "BookingChannel" NOT NULL,
    "createdByStaffId" INTEGER,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "pricePerPerson" DECIMAL(10,2) NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "holdUntil" TIMESTAMP(3) NOT NULL,
    "cancelReason" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traveler" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "dateOfBirth" DATE NOT NULL,
    "passportNoEncrypted" TEXT NOT NULL,
    "passportLast3" VARCHAR(3) NOT NULL,
    "passportExpiry" DATE NOT NULL,

    CONSTRAINT "traveler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "type" "PaymentType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "method" "PaymentMethod" NOT NULL,
    "gatewayTxnId" TEXT,
    "receiptNo" TEXT,
    "reason" TEXT,
    "refundStatus" "RefundStatus",
    "recordedByStaffId" INTEGER,
    "paidOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "travel_document" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "docType" "DocumentType" NOT NULL,
    "originalName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "uploadedById" INTEGER NOT NULL,
    "uploadedOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "travel_document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" VARCHAR(1000),
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cancellation_rule" (
    "id" SERIAL NOT NULL,
    "minDaysBefore" INTEGER NOT NULL,
    "maxDaysBefore" INTEGER,
    "refundPercent" INTEGER NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cancellation_rule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log_entry" (
    "id" BIGSERIAL NOT NULL,
    "actorType" TEXT NOT NULL,
    "actorId" INTEGER,
    "actorName" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_message" (
    "id" SERIAL NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "bodyHtml" TEXT NOT NULL,
    "attachments" JSONB,
    "status" "EmailStatus" NOT NULL DEFAULT 'WAITING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "nextTryAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_setting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "system_setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "customer_email_key" ON "customer"("email");

-- CreateIndex
CREATE INDEX "customer_phoneDigits_idx" ON "customer"("phoneDigits");

-- CreateIndex
CREATE UNIQUE INDEX "staff_user_email_key" ON "staff_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "auth_token_tokenHash_key" ON "auth_token"("tokenHash");

-- CreateIndex
CREATE INDEX "package_destinationId_idx" ON "package"("destinationId");

-- CreateIndex
CREATE INDEX "package_pricePerPerson_idx" ON "package"("pricePerPerson");

-- CreateIndex
CREATE INDEX "promotion_packageId_idx" ON "promotion"("packageId");

-- CreateIndex
CREATE INDEX "departure_departureDate_idx" ON "departure"("departureDate");

-- CreateIndex
CREATE INDEX "departure_packageId_idx" ON "departure"("packageId");

-- CreateIndex
CREATE UNIQUE INDEX "booking_reference_key" ON "booking"("reference");

-- CreateIndex
CREATE INDEX "booking_departureId_status_idx" ON "booking"("departureId", "status");

-- CreateIndex
CREATE INDEX "booking_customerId_idx" ON "booking"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "payment_gatewayTxnId_key" ON "payment"("gatewayTxnId");

-- CreateIndex
CREATE INDEX "payment_bookingId_idx" ON "payment"("bookingId");

-- CreateIndex
CREATE INDEX "payment_paidOn_idx" ON "payment"("paidOn");

-- CreateIndex
CREATE UNIQUE INDEX "review_bookingId_key" ON "review"("bookingId");

-- CreateIndex
CREATE INDEX "cancellation_rule_validFrom_idx" ON "cancellation_rule"("validFrom");

-- CreateIndex
CREATE INDEX "audit_log_entry_createdAt_idx" ON "audit_log_entry"("createdAt");

-- CreateIndex
CREATE INDEX "audit_log_entry_entity_entityId_idx" ON "audit_log_entry"("entity", "entityId");

-- CreateIndex
CREATE INDEX "email_message_status_nextTryAt_idx" ON "email_message"("status", "nextTryAt");

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_createdByStaffId_fkey" FOREIGN KEY ("createdByStaffId") REFERENCES "staff_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_token" ADD CONSTRAINT "auth_token_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_token" ADD CONSTRAINT "auth_token_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "package" ADD CONSTRAINT "package_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "destination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion" ADD CONSTRAINT "promotion_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departure" ADD CONSTRAINT "departure_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_departureId_fkey" FOREIGN KEY ("departureId") REFERENCES "departure"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking" ADD CONSTRAINT "booking_createdByStaffId_fkey" FOREIGN KEY ("createdByStaffId") REFERENCES "staff_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traveler" ADD CONSTRAINT "traveler_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_recordedByStaffId_fkey" FOREIGN KEY ("recordedByStaffId") REFERENCES "staff_user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_document" ADD CONSTRAINT "travel_document_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "travel_document" ADD CONSTRAINT "travel_document_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "staff_user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
