-- CreateEnum
CREATE TYPE "public"."CommissionRole" AS ENUM ('ORIGIN', 'DESTINATION', 'INTERNAL', 'INTERMEDIARY');

-- CreateEnum
CREATE TYPE "public"."CommissionSplitStatus" AS ENUM ('PENDING', 'APPROVED', 'SETTLED', 'REJECTED', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."charges_payment_items" ADD COLUMN     "commission_split_id" UUID,
ALTER COLUMN "transaction_charges_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."commission_splits" (
    "id" UUID NOT NULL,
    "transaction_charges_id" UUID NOT NULL,
    "organisation_id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "amount" DECIMAL(22,9) NOT NULL,
    "role" "public"."CommissionRole",
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "public"."CommissionSplitStatus" NOT NULL DEFAULT 'PENDING',
    "settled_at" TIMESTAMP(0),
    "settled_by" UUID,

    CONSTRAINT "commission_splits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commission_splits_organisation_id_idx" ON "public"."commission_splits"("organisation_id");

-- CreateIndex
CREATE INDEX "commission_splits_transaction_charges_id_idx" ON "public"."commission_splits"("transaction_charges_id");

-- CreateIndex
CREATE UNIQUE INDEX "commission_splits_transaction_charges_id_organisation_id_key" ON "public"."commission_splits"("transaction_charges_id", "organisation_id");

-- AddForeignKey
ALTER TABLE "public"."commission_splits" ADD CONSTRAINT "commission_splits_transaction_charges_id_fkey" FOREIGN KEY ("transaction_charges_id") REFERENCES "public"."transaction_charges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commission_splits" ADD CONSTRAINT "commission_splits_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commission_splits" ADD CONSTRAINT "commission_splits_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."commission_splits" ADD CONSTRAINT "commission_splits_settled_by_fkey" FOREIGN KEY ("settled_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charges_payment_items" ADD CONSTRAINT "charges_payment_items_commission_split_id_fkey" FOREIGN KEY ("commission_split_id") REFERENCES "public"."commission_splits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
