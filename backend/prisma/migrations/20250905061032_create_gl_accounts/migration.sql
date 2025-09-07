-- CreateEnum
CREATE TYPE "public"."UserTillStatus" AS ENUM ('CLOSED', 'OPEN', 'PENDING', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."GlAccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');

-- CreateEnum
CREATE TYPE "public"."GLTransactionType" AS ENUM ('VAULT_WITHDRAWAL', 'VAULT_DEPOSIT', 'TILL_OPEN', 'TILL_CLOSE', 'TILL_TOPUP', 'TILL_WITHDRAWAL', 'OUTBOUND_TRANSACTION', 'OUTBOUND_TRANSACTION_REVERSAL', 'INBOUND_TRANSACTION', 'INBOUND_TRANSACTION_REVERSAL');

-- CreateEnum
CREATE TYPE "public"."GLTransactionStatus" AS ENUM ('PENDING', 'APPROVED', 'POSTED', 'FAILED');

-- AlterTable
ALTER TABLE "public"."tills" ADD COLUMN     "currency_id" UUID,
ADD COLUMN     "location" VARCHAR(256),
ADD COLUMN     "vault_id" UUID;

-- AlterTable
ALTER TABLE "public"."transaction_charges" ADD COLUMN     "organisation_id" UUID;

-- CreateTable
CREATE TABLE "public"."user_tills" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "till_id" UUID NOT NULL,
    "balance" DECIMAL(22,9) NOT NULL,
    "date" TIMESTAMP(0) NOT NULL,
    "status" "public"."UserTillStatus" NOT NULL DEFAULT 'OPEN',

    CONSTRAINT "user_tills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."vaults" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "organisation_id" UUID NOT NULL,
    "currency_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vaults_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gl_accounts" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "public"."GlAccountType" NOT NULL,
    "balance" DECIMAL(22,9) NOT NULL,
    "currency_id" UUID,
    "locked_balance" DECIMAL(22,9) NOT NULL,
    "max_balance" DECIMAL(22,9),
    "min_balance" DECIMAL(22,9),
    "closed_at" TIMESTAMP(0),
    "close_reason" VARCHAR(256),
    "frozen_at" TIMESTAMP(0),
    "frozen_reason" VARCHAR(256),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "opened_by" UUID,
    "organisation_id" UUID,

    CONSTRAINT "gl_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gl_transactions" (
    "id" UUID NOT NULL,
    "transaction_type" "public"."GLTransactionType" NOT NULL,
    "status" "public"."GLTransactionStatus" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency_id" UUID,
    "description" TEXT NOT NULL,
    "vault_id" UUID,
    "user_till_id" UUID,
    "organisation_id" UUID,
    "customer_id" UUID,
    "transaction_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,

    CONSTRAINT "gl_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."gl_entries" (
    "id" UUID NOT NULL,
    "gl_account_id" UUID NOT NULL,
    "gl_transaction_id" UUID NOT NULL,
    "amount" DECIMAL(22,9) NOT NULL,
    "dr_cr" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,

    CONSTRAINT "gl_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_tills_user_id_idx" ON "public"."user_tills"("user_id");

-- CreateIndex
CREATE INDEX "user_tills_till_id_idx" ON "public"."user_tills"("till_id");

-- CreateIndex
CREATE INDEX "vaults_created_at_idx" ON "public"."vaults"("created_at");

-- CreateIndex
CREATE INDEX "vaults_updated_at_idx" ON "public"."vaults"("updated_at");

-- CreateIndex
CREATE INDEX "vaults_organisation_id_idx" ON "public"."vaults"("organisation_id");

-- CreateIndex
CREATE INDEX "vaults_currency_id_idx" ON "public"."vaults"("currency_id");

-- CreateIndex
CREATE INDEX "gl_accounts_created_at_idx" ON "public"."gl_accounts"("created_at");

-- CreateIndex
CREATE INDEX "gl_accounts_updated_at_idx" ON "public"."gl_accounts"("updated_at");

-- CreateIndex
CREATE INDEX "gl_accounts_currency_id_idx" ON "public"."gl_accounts"("currency_id");

-- CreateIndex
CREATE INDEX "gl_accounts_type_idx" ON "public"."gl_accounts"("type");

-- CreateIndex
CREATE INDEX "gl_entries_gl_account_id_idx" ON "public"."gl_entries"("gl_account_id");

-- CreateIndex
CREATE INDEX "gl_entries_gl_transaction_id_idx" ON "public"."gl_entries"("gl_transaction_id");

-- CreateIndex
CREATE INDEX "gl_entries_created_by_idx" ON "public"."gl_entries"("created_by");

-- CreateIndex
CREATE INDEX "gl_entries_dr_cr_idx" ON "public"."gl_entries"("dr_cr");

-- CreateIndex
CREATE INDEX "tills_vault_id_idx" ON "public"."tills"("vault_id");

-- CreateIndex
CREATE INDEX "tills_currency_id_idx" ON "public"."tills"("currency_id");

-- AddForeignKey
ALTER TABLE "public"."tills" ADD CONSTRAINT "tills_vault_id_fkey" FOREIGN KEY ("vault_id") REFERENCES "public"."vaults"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tills" ADD CONSTRAINT "tills_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tills" ADD CONSTRAINT "user_tills_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tills" ADD CONSTRAINT "user_tills_till_id_fkey" FOREIGN KEY ("till_id") REFERENCES "public"."tills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_charges" ADD CONSTRAINT "transaction_charges_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vaults" ADD CONSTRAINT "vaults_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."vaults" ADD CONSTRAINT "vaults_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_accounts" ADD CONSTRAINT "gl_accounts_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_accounts" ADD CONSTRAINT "gl_accounts_opened_by_fkey" FOREIGN KEY ("opened_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_accounts" ADD CONSTRAINT "gl_accounts_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_transactions" ADD CONSTRAINT "gl_transactions_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_transactions" ADD CONSTRAINT "gl_transactions_vault_id_fkey" FOREIGN KEY ("vault_id") REFERENCES "public"."vaults"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_transactions" ADD CONSTRAINT "gl_transactions_user_till_id_fkey" FOREIGN KEY ("user_till_id") REFERENCES "public"."user_tills"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_transactions" ADD CONSTRAINT "gl_transactions_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_transactions" ADD CONSTRAINT "gl_transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_transactions" ADD CONSTRAINT "gl_transactions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_transactions" ADD CONSTRAINT "gl_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_entries" ADD CONSTRAINT "gl_entries_gl_account_id_fkey" FOREIGN KEY ("gl_account_id") REFERENCES "public"."gl_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_entries" ADD CONSTRAINT "gl_entries_gl_transaction_id_fkey" FOREIGN KEY ("gl_transaction_id") REFERENCES "public"."gl_transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_entries" ADD CONSTRAINT "gl_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
