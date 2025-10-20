-- AlterTable
ALTER TABLE "public"."charges_payments" ALTER COLUMN "internal_total_amount" DROP NOT NULL,
ALTER COLUMN "external_total_amount" DROP NOT NULL,
ALTER COLUMN "destination_total_amount" DROP NOT NULL,
ALTER COLUMN "origin_total_amount" DROP NOT NULL;
