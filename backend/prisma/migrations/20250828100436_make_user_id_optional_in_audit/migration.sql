-- DropForeignKey
ALTER TABLE "public"."user_activities" DROP CONSTRAINT "user_activities_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."user_activities" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."user_activities" ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
