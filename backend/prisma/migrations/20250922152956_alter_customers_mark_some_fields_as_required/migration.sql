/*
  Warnings:

  - Made the column `email` on table `customers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone_number` on table `customers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `currency_id` on table `customers` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."customers" DROP CONSTRAINT "customers_currency_id_fkey";

-- AlterTable
ALTER TABLE "public"."customers" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "phone_number" SET NOT NULL,
ALTER COLUMN "currency_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."tills" ADD COLUMN     "deleted_at" TIMESTAMP(0);

-- CreateIndex
CREATE INDEX "tills_deleted_at_idx" ON "public"."tills"("deleted_at");

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET DEFAULT ON UPDATE CASCADE;
