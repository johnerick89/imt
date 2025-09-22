/*
  Warnings:

  - Made the column `contact_person` on table `organisations` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contact_email` on table `organisations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."organisations" ALTER COLUMN "contact_person" SET NOT NULL,
ALTER COLUMN "contact_email" SET NOT NULL;
