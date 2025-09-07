-- AlterTable
ALTER TABLE "public"."transaction_charges" ADD COLUMN     "external_amount" DECIMAL(22,9),
ADD COLUMN     "external_percentage" DECIMAL(18,9),
ADD COLUMN     "internal_amount" DECIMAL(22,9),
ADD COLUMN     "internal_percentage" DECIMAL(18,9);
