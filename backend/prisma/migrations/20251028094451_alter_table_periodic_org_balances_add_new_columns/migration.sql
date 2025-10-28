-- AlterTable
ALTER TABLE "public"."balance_histories" ADD COLUMN     "periodic_org_balance_id" UUID;

-- AlterTable
ALTER TABLE "public"."periodic_org_balances" ADD COLUMN     "deposits_amount" DECIMAL(22,9) DEFAULT 0,
ADD COLUMN     "withdrawals_amount" DECIMAL(22,9) DEFAULT 0,
ALTER COLUMN "opening_balance" SET DEFAULT 0,
ALTER COLUMN "transactions_in" DROP NOT NULL,
ALTER COLUMN "transactions_in" SET DEFAULT 0,
ALTER COLUMN "transactions_out" DROP NOT NULL,
ALTER COLUMN "transactions_out" SET DEFAULT 0,
ALTER COLUMN "commissions" DROP NOT NULL,
ALTER COLUMN "commissions" SET DEFAULT 0,
ALTER COLUMN "limit" SET DEFAULT 0;

-- AddForeignKey
ALTER TABLE "public"."balance_histories" ADD CONSTRAINT "balance_histories_periodic_org_balance_id_fkey" FOREIGN KEY ("periodic_org_balance_id") REFERENCES "public"."periodic_org_balances"("id") ON DELETE SET NULL ON UPDATE CASCADE;
