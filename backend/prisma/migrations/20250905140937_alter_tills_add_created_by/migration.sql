-- AlterTable
ALTER TABLE "public"."tills" ADD COLUMN     "created_by" UUID;

-- AddForeignKey
ALTER TABLE "public"."tills" ADD CONSTRAINT "tills_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
