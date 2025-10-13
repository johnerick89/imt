/*
  Warnings:

  - The values [FLOAT] on the enum `BalanceHistoryType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."BalanceHistoryType_new" AS ENUM ('ORG_BALANCE', 'TILL', 'VAULT', 'BANK_ACCOUNT', 'AGENCY_FLOAT');
ALTER TABLE "public"."balance_histories" ALTER COLUMN "entity_type" TYPE "public"."BalanceHistoryType_new" USING ("entity_type"::text::"public"."BalanceHistoryType_new");
ALTER TYPE "public"."BalanceHistoryType" RENAME TO "BalanceHistoryType_old";
ALTER TYPE "public"."BalanceHistoryType_new" RENAME TO "BalanceHistoryType";
DROP TYPE "public"."BalanceHistoryType_old";
COMMIT;
