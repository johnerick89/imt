/*
  Warnings:

  - Added the required column `charge_id` to the `transaction_charges` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "public"."TransactionChargeStatus" ADD VALUE 'FAILED';

-- AlterTable
ALTER TABLE "public"."transaction_charges" ADD COLUMN     "charge_id" UUID NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."transaction_charges" ADD CONSTRAINT "transaction_charges_charge_id_fkey" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
