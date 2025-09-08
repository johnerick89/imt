-- DropIndex
DROP INDEX "public"."organisations_name_idx";

-- CreateTable
CREATE TABLE "public"."charges_payments" (
    "id" UUID NOT NULL,
    "type" "public"."ChargeType" NOT NULL,
    "internal_total_amount" DECIMAL(22,9) NOT NULL,
    "external_total_amount" DECIMAL(22,9) NOT NULL,
    "reference_number" TEXT NOT NULL,
    "date_completed" TIMESTAMP(0) NOT NULL,
    "currency_id" UUID NOT NULL,
    "destination_org_id" UUID,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,
    "organisation_id" UUID NOT NULL,

    CONSTRAINT "charges_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."charges_payment_items" (
    "id" UUID NOT NULL,
    "charges_payment_id" UUID NOT NULL,
    "transaction_charges_id" UUID NOT NULL,
    "internal_amount_settled" DECIMAL(22,9) NOT NULL,
    "external_amount_settled" DECIMAL(22,9) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "charges_payment_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "charges_payments_reference_number_key" ON "public"."charges_payments"("reference_number");

-- CreateIndex
CREATE INDEX "charges_payments_type_idx" ON "public"."charges_payments"("type");

-- CreateIndex
CREATE INDEX "charges_payments_currency_id_idx" ON "public"."charges_payments"("currency_id");

-- CreateIndex
CREATE INDEX "charges_payments_destination_org_id_idx" ON "public"."charges_payments"("destination_org_id");

-- CreateIndex
CREATE INDEX "charges_payments_date_completed_idx" ON "public"."charges_payments"("date_completed");

-- CreateIndex
CREATE INDEX "charges_payments_organisation_id_idx" ON "public"."charges_payments"("organisation_id");

-- CreateIndex
CREATE INDEX "charges_payments_reference_number_idx" ON "public"."charges_payments"("reference_number");

-- CreateIndex
CREATE INDEX "charges_payment_items_charges_payment_id_idx" ON "public"."charges_payment_items"("charges_payment_id");

-- CreateIndex
CREATE INDEX "charges_payment_items_transaction_charges_id_idx" ON "public"."charges_payment_items"("transaction_charges_id");

-- CreateIndex
CREATE UNIQUE INDEX "charges_payment_items_charges_payment_id_transaction_charge_key" ON "public"."charges_payment_items"("charges_payment_id", "transaction_charges_id");

-- AddForeignKey
ALTER TABLE "public"."charges_payments" ADD CONSTRAINT "charges_payments_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charges_payments" ADD CONSTRAINT "charges_payments_destination_org_id_fkey" FOREIGN KEY ("destination_org_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charges_payments" ADD CONSTRAINT "charges_payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charges_payments" ADD CONSTRAINT "charges_payments_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charges_payment_items" ADD CONSTRAINT "charges_payment_items_charges_payment_id_fkey" FOREIGN KEY ("charges_payment_id") REFERENCES "public"."charges_payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charges_payment_items" ADD CONSTRAINT "charges_payment_items_transaction_charges_id_fkey" FOREIGN KEY ("transaction_charges_id") REFERENCES "public"."transaction_charges"("id") ON DELETE CASCADE ON UPDATE CASCADE;
