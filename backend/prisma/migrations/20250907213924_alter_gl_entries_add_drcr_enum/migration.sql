/*
  Warnings:

  - Changed the type of `dr_cr` on the `gl_entries` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."DrCr" AS ENUM ('DR', 'CR');

-- AlterTable
ALTER TABLE "public"."gl_entries" DROP COLUMN "dr_cr",
ADD COLUMN     "dr_cr" "public"."DrCr" NOT NULL;

-- CreateIndex
CREATE INDEX "gl_entries_dr_cr_idx" ON "public"."gl_entries"("dr_cr");
