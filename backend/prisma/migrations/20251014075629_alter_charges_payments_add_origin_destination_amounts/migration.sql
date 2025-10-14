/*
  Warnings:

  - Added the required column `destination_total_amount` to the `charges_payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin_total_amount` to the `charges_payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."charges_payments" ADD COLUMN     "destination_total_amount" DECIMAL(22,9) NOT NULL,
ADD COLUMN     "origin_total_amount" DECIMAL(22,9) NOT NULL;

-- AlterTable
ALTER TABLE "public"."corridors" ADD COLUMN  IF NOT EXISTS   "base_country_id" UUID;