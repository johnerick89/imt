-- CreateEnum
CREATE TYPE "public"."CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED');

-- AlterTable
ALTER TABLE "public"."customers" ADD COLUMN     "status" "public"."CustomerStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "customers_status_idx" ON "public"."customers"("status");
