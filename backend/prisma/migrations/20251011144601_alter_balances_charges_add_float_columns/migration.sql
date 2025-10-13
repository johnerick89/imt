/*
  Warnings:

  - A unique constraint covering the columns `[base_org_id,dest_org_id,currency_id]` on the table `org_balances` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."BalanceHistoryAction" AS ENUM ('INITIAL', 'DEPOSIT', 'RECEIPT', 'PAYOUT', 'LOCK', 'UNLOCK', 'SETTLEMENT', 'TOPUP', 'WITHDRAWAL', 'REVERSAL');

-- AlterEnum
ALTER TYPE "public"."BalanceHistoryType" ADD VALUE 'FLOAT';

-- AlterTable
ALTER TABLE "public"."balance_histories" ADD COLUMN     "action_type" "public"."BalanceHistoryAction";

-- AlterTable
ALTER TABLE "public"."charges" ADD COLUMN     "internal_share_percentage" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "public"."charges_payment_items" ADD COLUMN     "destination_amount_settled" DECIMAL(22,9) DEFAULT 0,
ADD COLUMN     "origin_amount_settled" DECIMAL(22,9) DEFAULT 0,
ALTER COLUMN "internal_amount_settled" SET DEFAULT 0,
ALTER COLUMN "external_amount_settled" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."transaction_charges" ADD COLUMN     "destination_amount" DECIMAL(22,9),
ADD COLUMN     "destination_percentage" DECIMAL(18,9),
ADD COLUMN     "origin_amount" DECIMAL(22,9),
ADD COLUMN     "origin_percentage" DECIMAL(18,9);

-- CreateIndex
CREATE INDEX "org_balances_dest_org_id_base_org_id_idx" ON "public"."org_balances"("dest_org_id", "base_org_id");

-- CreateIndex
CREATE UNIQUE INDEX "org_balances_base_org_id_dest_org_id_currency_id_key" ON "public"."org_balances"("base_org_id", "dest_org_id", "currency_id");
