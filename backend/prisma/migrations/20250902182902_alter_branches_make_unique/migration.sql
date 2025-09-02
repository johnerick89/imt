/*
  Warnings:

  - You are about to drop the column `country` on the `branches` table. All the data in the column will be lost.
  - Added the required column `country_id` to the `branches` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."branches" DROP COLUMN "country",
ADD COLUMN     "country_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."branches" ADD CONSTRAINT "branches_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
