-- AddForeignKey
ALTER TABLE "public"."corridors" ADD CONSTRAINT "corridors_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
