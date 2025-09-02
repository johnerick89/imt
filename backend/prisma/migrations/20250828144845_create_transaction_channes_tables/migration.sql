/*
  Warnings:

  - You are about to drop the column `permission_description` on the `permissions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."permissions" DROP COLUMN "permission_description",
ADD COLUMN     "description" TEXT;
