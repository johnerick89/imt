-- AlterTable
ALTER TABLE "public"."integrations" ADD COLUMN     "origin_organisation_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."integrations" ADD CONSTRAINT "integrations_origin_organisation_id_fkey" FOREIGN KEY ("origin_organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
