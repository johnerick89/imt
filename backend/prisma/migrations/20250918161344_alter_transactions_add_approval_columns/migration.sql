-- AlterEnum
ALTER TYPE "public"."RequestStatus" ADD VALUE 'APPROVED';

-- AlterTable
ALTER TABLE "public"."transactions" ADD COLUMN     "approved_at" TIMESTAMP(0),
ADD COLUMN     "approved_by" UUID;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
