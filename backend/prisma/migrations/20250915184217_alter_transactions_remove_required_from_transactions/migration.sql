-- DropForeignKey
ALTER TABLE "public"."transactions" DROP CONSTRAINT "transactions_till_id_fkey";

-- AlterTable
ALTER TABLE "public"."transactions" ALTER COLUMN "till_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_till_id_fkey" FOREIGN KEY ("till_id") REFERENCES "public"."tills"("id") ON DELETE SET NULL ON UPDATE CASCADE;
