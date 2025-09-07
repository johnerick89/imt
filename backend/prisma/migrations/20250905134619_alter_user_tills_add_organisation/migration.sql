-- AlterTable
ALTER TABLE "public"."tills" ADD COLUMN     "organisation_id" UUID;

-- AlterTable
ALTER TABLE "public"."user_tills" ADD COLUMN     "organisation_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."tills" ADD CONSTRAINT "tills_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tills" ADD CONSTRAINT "user_tills_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
