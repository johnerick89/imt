-- AlterTable
ALTER TABLE "public"."gl_transactions" ADD COLUMN     "till_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."gl_transactions" ADD CONSTRAINT "gl_transactions_till_id_fkey" FOREIGN KEY ("till_id") REFERENCES "public"."tills"("id") ON DELETE SET NULL ON UPDATE CASCADE;
