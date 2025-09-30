-- AlterTable
ALTER TABLE "public"."gl_accounts" ADD COLUMN     "counter_party_organisation_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."gl_accounts" ADD CONSTRAINT "gl_accounts_counter_party_organisation_id_fkey" FOREIGN KEY ("counter_party_organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
