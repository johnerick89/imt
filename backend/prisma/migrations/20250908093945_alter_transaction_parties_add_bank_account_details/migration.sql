/*
  Warnings:

  - You are about to drop the column `payout_account` on the `transaction_parties` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."transaction_parties" DROP COLUMN "payout_account",
ADD COLUMN     "payout_bank_account_name" TEXT,
ADD COLUMN     "payout_bank_account_number" TEXT,
ADD COLUMN     "payout_bank_name" TEXT;
