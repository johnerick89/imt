-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_beneficiary_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_customer_id_fkey";

-- AlterTable
ALTER TABLE "public"."transactions" ALTER COLUMN "customer_id" DROP NOT NULL,
ALTER COLUMN "beneficiary_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "public"."beneficiaries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
