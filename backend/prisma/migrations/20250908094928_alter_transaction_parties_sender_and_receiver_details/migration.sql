-- AlterTable
ALTER TABLE "public"."transactions" ADD COLUMN     "receiver_trasaction_party_id" UUID,
ADD COLUMN     "sender_trasaction_party_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_sender_trasaction_party_id_fkey" FOREIGN KEY ("sender_trasaction_party_id") REFERENCES "public"."transaction_parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_receiver_trasaction_party_id_fkey" FOREIGN KEY ("receiver_trasaction_party_id") REFERENCES "public"."transaction_parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
