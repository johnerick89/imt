-- AlterTable
ALTER TABLE "public"."gl_accounts" ADD COLUMN     "float_org_id" UUID;

-- AddForeignKey
ALTER TABLE "public"."gl_accounts" ADD CONSTRAINT "gl_accounts_float_org_id_fkey" FOREIGN KEY ("float_org_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
