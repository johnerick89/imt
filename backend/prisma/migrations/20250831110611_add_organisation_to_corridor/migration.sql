/*
  Warnings:

  - Added the required column `organisation_id` to the `corridors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."corridors" ADD COLUMN     "organisation_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."corridors" ADD CONSTRAINT "corridors_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
