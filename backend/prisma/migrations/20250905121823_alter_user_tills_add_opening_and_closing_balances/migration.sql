/*
  Warnings:

  - You are about to drop the column `balance` on the `user_tills` table. All the data in the column will be lost.
  - Added the required column `opening_balance` to the `user_tills` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `user_tills` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."user_tills" DROP COLUMN "balance",
ADD COLUMN     "closed_at" TIMESTAMP(0),
ADD COLUMN     "closed_by" UUID,
ADD COLUMN     "closing_balance" DECIMAL(22,9),
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "opening_balance" DECIMAL(22,9) NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."user_tills" ADD CONSTRAINT "user_tills_closed_by_fkey" FOREIGN KEY ("closed_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
