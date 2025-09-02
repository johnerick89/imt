/*
  Warnings:

  - You are about to drop the column `integration_type` on the `TransactionChannel` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."TransactionChannel" DROP COLUMN "integration_type";
