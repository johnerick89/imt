-- AlterTable
ALTER TABLE "public"."vaults" ADD COLUMN     "created_by" UUID;

-- AddForeignKey
ALTER TABLE "public"."vaults" ADD CONSTRAINT "vaults_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
