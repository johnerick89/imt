/*
  Warnings:

  - You are about to drop the column `gl_account_id` on the `org_balances` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."org_balances" DROP CONSTRAINT "org_balances_gl_account_id_fkey";

-- DropIndex
DROP INDEX "public"."org_balances_gl_account_id_idx";

-- AlterTable
ALTER TABLE "public"."gl_accounts" ADD COLUMN     "org_balance_id" UUID;

-- AlterTable
ALTER TABLE "public"."org_balances" DROP COLUMN "gl_account_id";

-- AddForeignKey
ALTER TABLE "public"."gl_accounts" ADD CONSTRAINT "gl_accounts_org_balance_id_fkey" FOREIGN KEY ("org_balance_id") REFERENCES "public"."org_balances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
