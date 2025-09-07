/*
  Warnings:

  - You are about to drop the `balance_history` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."balance_history" DROP CONSTRAINT "balance_history_created_by_fkey";

-- DropForeignKey
ALTER TABLE "public"."balance_history" DROP CONSTRAINT "balance_history_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."balance_history" DROP CONSTRAINT "balance_history_gl_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."balance_history" DROP CONSTRAINT "balance_history_org_balance_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."balance_history" DROP CONSTRAINT "balance_history_till_balance_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."balance_history" DROP CONSTRAINT "balance_history_transaction_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."balance_history" DROP CONSTRAINT "balance_history_vault_balance_id_fkey";

-- AlterTable
ALTER TABLE "public"."gl_accounts" ADD COLUMN     "bank_account_id" UUID;

-- AlterTable
ALTER TABLE "public"."gl_transactions" ADD COLUMN     "balance_history_id" UUID;

-- DropTable
DROP TABLE "public"."balance_history";

-- CreateTable
CREATE TABLE "public"."balance_histories" (
    "id" UUID NOT NULL,
    "entity_type" "public"."BalanceHistoryType" NOT NULL,
    "entity_id" UUID NOT NULL,
    "currency_id" UUID NOT NULL,
    "old_balance" DECIMAL(22,9),
    "new_balance" DECIMAL(22,9) NOT NULL,
    "change_amount" DECIMAL(22,9) NOT NULL,
    "transaction_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "gl_entry_id" UUID,
    "org_balance_id" UUID,
    "till_balance_id" UUID,
    "vault_balance_id" UUID,
    "bank_account_id" UUID,

    CONSTRAINT "balance_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bank_accounts" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "account_number" VARCHAR(50) NOT NULL,
    "bank_name" VARCHAR(100) NOT NULL,
    "swift_code" VARCHAR(11),
    "currency_id" UUID NOT NULL,
    "balance" DECIMAL(22,9) NOT NULL,
    "locked_balance" DECIMAL(22,9),
    "organisation_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,

    CONSTRAINT "bank_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "balance_histories_entity_type_entity_id_idx" ON "public"."balance_histories"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "balance_histories_currency_id_idx" ON "public"."balance_histories"("currency_id");

-- CreateIndex
CREATE INDEX "balance_histories_transaction_id_idx" ON "public"."balance_histories"("transaction_id");

-- CreateIndex
CREATE INDEX "balance_histories_gl_entry_id_idx" ON "public"."balance_histories"("gl_entry_id");

-- CreateIndex
CREATE INDEX "bank_accounts_currency_id_idx" ON "public"."bank_accounts"("currency_id");

-- CreateIndex
CREATE INDEX "bank_accounts_organisation_id_idx" ON "public"."bank_accounts"("organisation_id");

-- AddForeignKey
ALTER TABLE "public"."gl_accounts" ADD CONSTRAINT "gl_accounts_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_transactions" ADD CONSTRAINT "gl_transactions_balance_history_id_fkey" FOREIGN KEY ("balance_history_id") REFERENCES "public"."balance_histories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_histories" ADD CONSTRAINT "balance_histories_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_histories" ADD CONSTRAINT "balance_histories_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_histories" ADD CONSTRAINT "balance_histories_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_histories" ADD CONSTRAINT "balance_histories_gl_entry_id_fkey" FOREIGN KEY ("gl_entry_id") REFERENCES "public"."gl_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_histories" ADD CONSTRAINT "balance_histories_org_balance_id_fkey" FOREIGN KEY ("org_balance_id") REFERENCES "public"."org_balances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_histories" ADD CONSTRAINT "balance_histories_till_balance_id_fkey" FOREIGN KEY ("till_balance_id") REFERENCES "public"."till_balances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_histories" ADD CONSTRAINT "balance_histories_vault_balance_id_fkey" FOREIGN KEY ("vault_balance_id") REFERENCES "public"."vault_balances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_histories" ADD CONSTRAINT "balance_histories_bank_account_id_fkey" FOREIGN KEY ("bank_account_id") REFERENCES "public"."bank_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bank_accounts" ADD CONSTRAINT "bank_accounts_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bank_accounts" ADD CONSTRAINT "bank_accounts_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bank_accounts" ADD CONSTRAINT "bank_accounts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
