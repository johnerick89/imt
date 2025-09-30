-- AlterTable
ALTER TABLE "public"."charges_payment_items" ADD COLUMN     "amount_settled" DECIMAL(22,9) NOT NULL DEFAULT 0;
