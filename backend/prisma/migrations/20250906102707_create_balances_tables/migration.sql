-- CreateEnum
CREATE TYPE "public"."BalanceHistoryType" AS ENUM ('ORG_BALANCE', 'TILL_BALANCE', 'VAULT_BALANCE');

-- CreateTable
CREATE TABLE "public"."org_balances" (
    "id" UUID NOT NULL,
    "base_org_id" UUID NOT NULL,
    "dest_org_id" UUID NOT NULL,
    "currency_id" UUID NOT NULL,
    "balance" DECIMAL(22,9) NOT NULL,
    "locked_balance" DECIMAL(22,9),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "gl_account_id" UUID,
    "created_by" UUID,

    CONSTRAINT "org_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."till_balances" (
    "id" UUID NOT NULL,
    "till_id" UUID NOT NULL,
    "currency_id" UUID NOT NULL,
    "balance" DECIMAL(22,9) NOT NULL,
    "locked_balance" DECIMAL(22,9),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "gl_account_id" UUID,
    "created_by" UUID,

    CONSTRAINT "till_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vault_balances" (
    "id" UUID NOT NULL,
    "vault_id" UUID NOT NULL,
    "currency_id" UUID NOT NULL,
    "balance" DECIMAL(22,9) NOT NULL,
    "locked_balance" DECIMAL(22,9),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "gl_account_id" UUID,
    "created_by" UUID,

    CONSTRAINT "vault_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."balance_history" (
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

    CONSTRAINT "balance_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "org_balances_base_org_id_idx" ON "public"."org_balances"("base_org_id");

-- CreateIndex
CREATE INDEX "org_balances_dest_org_id_idx" ON "public"."org_balances"("dest_org_id");

-- CreateIndex
CREATE INDEX "org_balances_currency_id_idx" ON "public"."org_balances"("currency_id");

-- CreateIndex
CREATE INDEX "org_balances_gl_account_id_idx" ON "public"."org_balances"("gl_account_id");

-- CreateIndex
CREATE INDEX "till_balances_till_id_idx" ON "public"."till_balances"("till_id");

-- CreateIndex
CREATE INDEX "till_balances_currency_id_idx" ON "public"."till_balances"("currency_id");

-- CreateIndex
CREATE INDEX "till_balances_gl_account_id_idx" ON "public"."till_balances"("gl_account_id");

-- CreateIndex
CREATE INDEX "vault_balances_vault_id_idx" ON "public"."vault_balances"("vault_id");

-- CreateIndex
CREATE INDEX "vault_balances_currency_id_idx" ON "public"."vault_balances"("currency_id");

-- CreateIndex
CREATE INDEX "vault_balances_gl_account_id_idx" ON "public"."vault_balances"("gl_account_id");

-- CreateIndex
CREATE INDEX "balance_history_entity_type_entity_id_idx" ON "public"."balance_history"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "balance_history_currency_id_idx" ON "public"."balance_history"("currency_id");

-- CreateIndex
CREATE INDEX "balance_history_transaction_id_idx" ON "public"."balance_history"("transaction_id");

-- CreateIndex
CREATE INDEX "balance_history_gl_entry_id_idx" ON "public"."balance_history"("gl_entry_id");

-- AddForeignKey
ALTER TABLE "public"."org_balances" ADD CONSTRAINT "org_balances_base_org_id_fkey" FOREIGN KEY ("base_org_id") REFERENCES "public"."organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."org_balances" ADD CONSTRAINT "org_balances_dest_org_id_fkey" FOREIGN KEY ("dest_org_id") REFERENCES "public"."organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."org_balances" ADD CONSTRAINT "org_balances_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."org_balances" ADD CONSTRAINT "org_balances_gl_account_id_fkey" FOREIGN KEY ("gl_account_id") REFERENCES "public"."gl_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."org_balances" ADD CONSTRAINT "org_balances_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."till_balances" ADD CONSTRAINT "till_balances_till_id_fkey" FOREIGN KEY ("till_id") REFERENCES "public"."tills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."till_balances" ADD CONSTRAINT "till_balances_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."till_balances" ADD CONSTRAINT "till_balances_gl_account_id_fkey" FOREIGN KEY ("gl_account_id") REFERENCES "public"."gl_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."till_balances" ADD CONSTRAINT "till_balances_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vault_balances" ADD CONSTRAINT "vault_balances_vault_id_fkey" FOREIGN KEY ("vault_id") REFERENCES "public"."vaults"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vault_balances" ADD CONSTRAINT "vault_balances_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vault_balances" ADD CONSTRAINT "vault_balances_gl_account_id_fkey" FOREIGN KEY ("gl_account_id") REFERENCES "public"."gl_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vault_balances" ADD CONSTRAINT "vault_balances_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_history" ADD CONSTRAINT "balance_history_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_history" ADD CONSTRAINT "balance_history_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_history" ADD CONSTRAINT "balance_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_history" ADD CONSTRAINT "balance_history_gl_entry_id_fkey" FOREIGN KEY ("gl_entry_id") REFERENCES "public"."gl_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_history" ADD CONSTRAINT "balance_history_org_balance_id_fkey" FOREIGN KEY ("org_balance_id") REFERENCES "public"."org_balances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_history" ADD CONSTRAINT "balance_history_till_balance_id_fkey" FOREIGN KEY ("till_balance_id") REFERENCES "public"."till_balances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."balance_history" ADD CONSTRAINT "balance_history_vault_balance_id_fkey" FOREIGN KEY ("vault_balance_id") REFERENCES "public"."vault_balances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
