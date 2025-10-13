-- AlterTable
ALTER TABLE "public"."balance_histories" ADD COLUMN     "float_org_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."balance_histories" ADD CONSTRAINT "balance_histories_float_org_id_fkey" FOREIGN KEY ("float_org_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
