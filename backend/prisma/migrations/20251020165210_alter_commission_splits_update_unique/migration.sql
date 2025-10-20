/*
  Warnings:

  - A unique constraint covering the columns `[transaction_charges_id,organisation_id,role]` on the table `commission_splits` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."commission_splits_transaction_charges_id_organisation_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "commission_splits_transaction_charges_id_organisation_id_ro_key" ON "public"."commission_splits"("transaction_charges_id", "organisation_id", "role");
