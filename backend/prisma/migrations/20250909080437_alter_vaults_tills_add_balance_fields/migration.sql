/*
  Warnings:

  - You are about to drop the column `till_balance_id` on the `balance_histories` table. All the data in the column will be lost.
  - You are about to drop the column `vault_balance_id` on the `balance_histories` table. All the data in the column will be lost.
  - You are about to drop the `till_balances` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vault_balances` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."balance_histories" DROP CONSTRAINT "balance_histories_till_balance_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."balance_histories" DROP CONSTRAINT "balance_histories_vault_balance_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."till_balances" DROP CONSTRAINT "till_balances_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."till_balances" DROP CONSTRAINT "till_balances_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."till_balances" DROP CONSTRAINT "till_balances_gl_account_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."till_balances" DROP CONSTRAINT "till_balances_till_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."vault_balances" DROP CONSTRAINT "vault_balances_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."vault_balances" DROP CONSTRAINT "vault_balances_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."vault_balances" DROP CONSTRAINT "vault_balances_gl_account_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."vault_balances" DROP CONSTRAINT "vault_balances_vault_id_fkey";

-- AlterTable
ALTER TABLE "public"."balance_histories" DROP COLUMN "till_balance_id",
DROP COLUMN "vault_balance_id",
ADD COLUMN     "till_id" UUID,
ADD COLUMN     "vault_id" UUID;

-- AlterTable
ALTER TABLE "public"."tills" ADD COLUMN     "balance" DECIMAL(22,9),
ADD COLUMN     "locked_balance" DECIMAL(22,9);

-- AlterTable
ALTER TABLE "public"."vaults" ADD COLUMN     "balance" DECIMAL(22,9),
ADD COLUMN     "locked_balance" DECIMAL(22,9);

-- DropTable
DROP TABLE "public"."till_balances";

-- DropTable
DROP TABLE "public"."vault_balances";

-- AddForeignKey
ALTER TABLE "public"."balance_histories" ADD CONSTRAINT "balance_histories_till_id_fkey" FOREIGN KEY ("till_id") REFERENCES "public"."tills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_histories" ADD CONSTRAINT "balance_histories_vault_id_fkey" FOREIGN KEY ("vault_id") REFERENCES "public"."vaults"("id") ON DELETE SET NULL ON UPDATE CASCADE;
