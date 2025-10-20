/*
  Warnings:

  - A unique constraint covering the columns `[charges_payment_id,transaction_charges_id,commission_split_id]` on the table `charges_payment_items` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."charges_payment_items_charges_payment_id_transaction_charge_key";

-- CreateIndex
CREATE UNIQUE INDEX "charges_payment_items_charges_payment_id_transaction_charge_key" ON "public"."charges_payment_items"("charges_payment_id", "transaction_charges_id", "commission_split_id");
