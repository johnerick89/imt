/*
  Warnings:

  - Added the required column `amount` to the `charges_payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."charges_payments" ADD COLUMN     "amount" DECIMAL(22,9) NOT NULL;
