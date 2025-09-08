-- AlterTable
ALTER TABLE "public"."beneficiaries" ADD COLUMN     "bank_address" TEXT,
ADD COLUMN     "bank_city" TEXT,
ADD COLUMN     "bank_name" TEXT,
ADD COLUMN     "bank_state" TEXT,
ADD COLUMN     "bank_zip" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "phone" TEXT;

-- CreateIndex
CREATE INDEX "beneficiaries_email_idx" ON "public"."beneficiaries"("email");

-- CreateIndex
CREATE INDEX "beneficiaries_phone_idx" ON "public"."beneficiaries"("phone");

-- CreateIndex
CREATE INDEX "beneficiaries_bank_name_idx" ON "public"."beneficiaries"("bank_name");

-- CreateIndex
CREATE INDEX "beneficiaries_bank_address_idx" ON "public"."beneficiaries"("bank_address");

-- CreateIndex
CREATE INDEX "beneficiaries_bank_city_idx" ON "public"."beneficiaries"("bank_city");

-- CreateIndex
CREATE INDEX "beneficiaries_bank_state_idx" ON "public"."beneficiaries"("bank_state");

-- CreateIndex
CREATE INDEX "beneficiaries_bank_zip_idx" ON "public"."beneficiaries"("bank_zip");
