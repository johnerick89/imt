/*
  Warnings:

  - The `status` column on the `charges_payments` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ChargesPaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "public"."charges_payments" DROP COLUMN "status",
ADD COLUMN     "status" "public"."ChargesPaymentStatus" NOT NULL DEFAULT 'PENDING';
