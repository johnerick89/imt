-- AlterTable
ALTER TABLE "public"."gl_accounts" ADD COLUMN     "charge_id" UUID,
ADD COLUMN     "till_id" UUID,
ADD COLUMN     "vault_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."gl_accounts" ADD CONSTRAINT "gl_accounts_charge_id_fkey" FOREIGN KEY ("charge_id") REFERENCES "public"."charges"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_accounts" ADD CONSTRAINT "gl_accounts_vault_id_fkey" FOREIGN KEY ("vault_id") REFERENCES "public"."vaults"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."gl_accounts" ADD CONSTRAINT "gl_accounts_till_id_fkey" FOREIGN KEY ("till_id") REFERENCES "public"."tills"("id") ON DELETE SET NULL ON UPDATE CASCADE;
