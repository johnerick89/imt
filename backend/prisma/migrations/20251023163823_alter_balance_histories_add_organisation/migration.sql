-- AlterTable
ALTER TABLE "public"."balance_histories" ADD COLUMN     "organisation_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."balance_histories" ADD CONSTRAINT "balance_histories_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
