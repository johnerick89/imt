-- AlterTable
ALTER TABLE "public"."commission_splits" ADD COLUMN     "currency_id" UUID;

-- AlterTable
ALTER TABLE "public"."transaction_charges" ADD COLUMN     "destination_amount_settled" DECIMAL(22,9),
ADD COLUMN     "internal_amount_settled" DECIMAL(22,9),
ADD COLUMN     "origin_amount_settled" DECIMAL(22,9);

-- AddForeignKey
ALTER TABLE "public"."commission_splits" ADD CONSTRAINT "commission_splits_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
