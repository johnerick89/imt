/*
  Warnings:

  - You are about to drop the column `userId` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- AlterTable
ALTER TABLE "public"."transactions" DROP COLUMN "userId",
ADD COLUMN     "outbound_transaction_id" UUID,
ADD COLUMN     "outbound_transaction_no" VARCHAR(128);
