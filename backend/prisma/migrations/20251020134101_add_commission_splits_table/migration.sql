-- AlterTable
ALTER TABLE "public"."charges_payment_items" ALTER COLUMN "internal_amount_settled" DROP NOT NULL,
ALTER COLUMN "external_amount_settled" DROP NOT NULL;
