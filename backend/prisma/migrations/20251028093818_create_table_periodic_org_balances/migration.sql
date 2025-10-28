-- CreateTable
CREATE TABLE "public"."periodic_org_balances" (
    "id" UUID NOT NULL,
    "org_balance_id" UUID NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "date_from" TIMESTAMP(3) NOT NULL,
    "date_to" TIMESTAMP(3),
    "is_current" BOOLEAN NOT NULL DEFAULT false,
    "opening_balance" DECIMAL(22,9) NOT NULL,
    "closing_balance" DECIMAL(22,9),
    "transactions_in" DECIMAL(22,9) NOT NULL,
    "transactions_out" DECIMAL(22,9) NOT NULL,
    "commissions" DECIMAL(22,9) NOT NULL,
    "limit" DECIMAL(22,9),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "organisation_id" UUID NOT NULL,

    CONSTRAINT "periodic_org_balances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "periodic_org_balances_org_balance_id_year_month_idx" ON "public"."periodic_org_balances"("org_balance_id", "year", "month");

-- CreateIndex
CREATE INDEX "periodic_org_balances_is_current_idx" ON "public"."periodic_org_balances"("is_current");

-- CreateIndex
CREATE INDEX "periodic_org_balances_year_month_idx" ON "public"."periodic_org_balances"("year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "periodic_org_balances_org_balance_id_year_month_key" ON "public"."periodic_org_balances"("org_balance_id", "year", "month");

-- AddForeignKey
ALTER TABLE "public"."periodic_org_balances" ADD CONSTRAINT "periodic_org_balances_org_balance_id_fkey" FOREIGN KEY ("org_balance_id") REFERENCES "public"."org_balances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."periodic_org_balances" ADD CONSTRAINT "periodic_org_balances_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."periodic_org_balances" ADD CONSTRAINT "periodic_org_balances_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
