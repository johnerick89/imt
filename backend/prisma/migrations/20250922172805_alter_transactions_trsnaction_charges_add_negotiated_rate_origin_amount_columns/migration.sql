-- AlterTable
ALTER TABLE "public"."organisations" ADD COLUMN     "amount_to_send_base_currency" DECIMAL(18,9),
ADD COLUMN     "amount_to_send_destination_currency" DECIMAL(18,9);

-- AlterTable
ALTER TABLE "public"."transaction_charges" ADD COLUMN     "destination_organisation_id" UUID,
ADD COLUMN     "negotiated_rate" DECIMAL(18,9),
ADD COLUMN     "original_rate" DECIMAL(18,9);

-- CreateIndex
CREATE INDEX "transaction_charges_charge_id_idx" ON "public"."transaction_charges"("charge_id");

-- AddForeignKey
ALTER TABLE "public"."transaction_charges" ADD CONSTRAINT "transaction_charges_destination_organisation_id_fkey" FOREIGN KEY ("destination_organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
