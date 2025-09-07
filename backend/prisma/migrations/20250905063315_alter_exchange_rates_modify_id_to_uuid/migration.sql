/*
  Warnings:

  - The primary key for the `exchange_rates` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `exchange_rate_id` column on the `transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `external_exchange_rate_id` column on the `transactions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `id` on the `exchange_rates` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_exchange_rate_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_external_exchange_rate_id_fkey";

-- AlterTable
ALTER TABLE "public"."exchange_rates" DROP CONSTRAINT "exchange_rates_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ADD CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "public"."transactions" DROP COLUMN "exchange_rate_id",
ADD COLUMN     "exchange_rate_id" UUID,
DROP COLUMN "external_exchange_rate_id",
ADD COLUMN     "external_exchange_rate_id" UUID;

-- CreateIndex
CREATE INDEX "transactions_exchange_rate_id_idx" ON "public"."transactions"("exchange_rate_id");

-- CreateIndex
CREATE INDEX "transactions_external_exchange_rate_id_idx" ON "public"."transactions"("external_exchange_rate_id");

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_exchange_rate_id_fkey" FOREIGN KEY ("exchange_rate_id") REFERENCES "public"."exchange_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_external_exchange_rate_id_fkey" FOREIGN KEY ("external_exchange_rate_id") REFERENCES "public"."exchange_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
