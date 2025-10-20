-- AlterTable
ALTER TABLE "public"."charges_payments" ADD COLUMN     "approved_by" UUID;

-- AddForeignKey
ALTER TABLE "public"."charges_payments" ADD CONSTRAINT "charges_payments_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
