-- CreateEnum
CREATE TYPE "public"."IntegrationType" AS ENUM ('API', 'WEBHOOK', 'EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "public"."IntegrationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED');

-- AlterTable
ALTER TABLE "public"."countries" ADD COLUMN     "created_by" UUID;

-- AlterTable
ALTER TABLE "public"."organisations" ADD COLUMN     "created_by" UUID;

-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "created_by" UUID;

-- CreateTable
CREATE TABLE "public"."integrations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organisation_id" UUID,
    "type" "public"."IntegrationType" NOT NULL,
    "status" "public"."IntegrationStatus" NOT NULL,
    "api_key" TEXT,
    "api_secret" TEXT,
    "endpoint_url" TEXT,
    "webhook_secret" TEXT,
    "configuration" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_activities" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "data" JSONB,
    "organisation_id" UUID,
    "changes" JSONB,
    "ip_address" TEXT,
    "request_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integrations_name_idx" ON "public"."integrations"("name");

-- CreateIndex
CREATE INDEX "integrations_organisation_id_idx" ON "public"."integrations"("organisation_id");

-- CreateIndex
CREATE INDEX "integrations_description_idx" ON "public"."integrations"("description");

-- CreateIndex
CREATE INDEX "integrations_type_idx" ON "public"."integrations"("type");

-- CreateIndex
CREATE INDEX "integrations_status_idx" ON "public"."integrations"("status");

-- CreateIndex
CREATE INDEX "integrations_created_at_idx" ON "public"."integrations"("created_at");

-- CreateIndex
CREATE INDEX "integrations_updated_at_idx" ON "public"."integrations"("updated_at");

-- CreateIndex
CREATE INDEX "integrations_created_by_idx" ON "public"."integrations"("created_by");

-- CreateIndex
CREATE INDEX "user_activities_user_id_idx" ON "public"."user_activities"("user_id");

-- CreateIndex
CREATE INDEX "user_activities_entity_type_idx" ON "public"."user_activities"("entity_type");

-- CreateIndex
CREATE INDEX "user_activities_entity_id_idx" ON "public"."user_activities"("entity_id");

-- CreateIndex
CREATE INDEX "user_activities_action_idx" ON "public"."user_activities"("action");

-- CreateIndex
CREATE INDEX "user_activities_organisation_id_idx" ON "public"."user_activities"("organisation_id");

-- CreateIndex
CREATE INDEX "user_activities_created_at_idx" ON "public"."user_activities"("created_at");

-- CreateIndex
CREATE INDEX "users_created_by_idx" ON "public"."users"("created_by");

-- AddForeignKey
ALTER TABLE "public"."countries" ADD CONSTRAINT "countries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organisations" ADD CONSTRAINT "organisations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."integrations" ADD CONSTRAINT "integrations_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."integrations" ADD CONSTRAINT "integrations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_activities" ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_activities" ADD CONSTRAINT "user_activities_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
