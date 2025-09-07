-- AlterTable
ALTER TABLE "public"."corridors" ADD COLUMN     "origin_organisation_id" UUID;

-- AlterTable
ALTER TABLE "public"."transactions" ADD COLUMN     "destination_country_id" UUID,
ADD COLUMN     "origin_country_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."corridors" ADD CONSTRAINT "corridors_origin_organisation_id_fkey" FOREIGN KEY ("origin_organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_origin_country_id_fkey" FOREIGN KEY ("origin_country_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_destination_country_id_fkey" FOREIGN KEY ("destination_country_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
