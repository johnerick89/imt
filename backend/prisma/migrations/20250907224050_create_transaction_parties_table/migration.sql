-- CreateEnum
CREATE TYPE "public"."PartyRole" AS ENUM ('SENDER', 'RECEIVER');

-- CreateTable
CREATE TABLE "public"."transaction_parties" (
    "id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "role" "public"."PartyRole" NOT NULL,
    "name" TEXT NOT NULL,
    "id_type" "public"."IndividualIDType",
    "id_number" TEXT,
    "nationality_id" UUID,
    "payout_method_channel_id" UUID,
    "payout_account" TEXT,
    "payout_phone" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "organisation_id" UUID NOT NULL,
    "created_by" UUID,

    CONSTRAINT "transaction_parties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transaction_parties_transaction_id_idx" ON "public"."transaction_parties"("transaction_id");

-- CreateIndex
CREATE INDEX "transaction_parties_role_idx" ON "public"."transaction_parties"("role");

-- CreateIndex
CREATE INDEX "transaction_parties_nationality_id_idx" ON "public"."transaction_parties"("nationality_id");

-- CreateIndex
CREATE INDEX "transaction_parties_organisation_id_idx" ON "public"."transaction_parties"("organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_parties_transaction_id_role_key" ON "public"."transaction_parties"("transaction_id", "role");

-- AddForeignKey
ALTER TABLE "public"."transaction_parties" ADD CONSTRAINT "transaction_parties_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_parties" ADD CONSTRAINT "transaction_parties_nationality_id_fkey" FOREIGN KEY ("nationality_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_parties" ADD CONSTRAINT "transaction_parties_payout_method_channel_id_fkey" FOREIGN KEY ("payout_method_channel_id") REFERENCES "public"."transaction_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_parties" ADD CONSTRAINT "transaction_parties_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_parties" ADD CONSTRAINT "transaction_parties_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
