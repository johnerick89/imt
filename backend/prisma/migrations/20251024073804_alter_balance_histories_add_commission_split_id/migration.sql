-- AlterTable
ALTER TABLE "public"."balance_histories" ADD COLUMN     "commission_split_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."balance_histories" ADD CONSTRAINT "balance_histories_commission_split_id_fkey" FOREIGN KEY ("commission_split_id") REFERENCES "public"."commission_splits"("id") ON DELETE SET NULL ON UPDATE CASCADE;
