-- CreateEnum
CREATE TYPE "public"."AuditAction" AS ENUM ('CREATED', 'APPROVED', 'CANCELLED', 'REVERSED', 'STATUS_CHANGED', 'REMITTANCE_STATUS_CHANGED', 'REQUEST_STATUS_CHANGED');

-- CreateTable
CREATE TABLE "public"."transaction_audits" (
    "id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "action" "public"."AuditAction" NOT NULL,
    "user_id" UUID,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "details" JSONB,
    "ip_address" VARCHAR(45),
    "notes" VARCHAR(1024),

    CONSTRAINT "transaction_audits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transaction_audits_transaction_id_idx" ON "public"."transaction_audits"("transaction_id");

-- CreateIndex
CREATE INDEX "transaction_audits_user_id_idx" ON "public"."transaction_audits"("user_id");

-- CreateIndex
CREATE INDEX "transaction_audits_timestamp_idx" ON "public"."transaction_audits"("timestamp");

-- CreateIndex
CREATE INDEX "transaction_audits_action_idx" ON "public"."transaction_audits"("action");

-- AddForeignKey
ALTER TABLE "public"."transaction_audits" ADD CONSTRAINT "transaction_audits_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_audits" ADD CONSTRAINT "transaction_audits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
