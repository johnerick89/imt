-- AlterTable
ALTER TABLE "public"."beneficiaries" ADD COLUMN     "created_by" UUID;

-- AlterTable
ALTER TABLE "public"."customers" ADD COLUMN     "created_by" UUID;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beneficiaries" ADD CONSTRAINT "beneficiaries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
