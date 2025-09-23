-- AlterTable
ALTER TABLE "public"."transaction_audits" ADD COLUMN     "new_user_id" UUID;

-- AlterTable
ALTER TABLE "public"."transactions" ADD COLUMN     "assigned_to" UUID,
ADD COLUMN     "userId" UUID;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_audits" ADD CONSTRAINT "transaction_audits_new_user_id_fkey" FOREIGN KEY ("new_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
