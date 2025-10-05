-- CreateTable
CREATE TABLE "public"."validation_rules" (
    "id" SERIAL NOT NULL,
    "entity" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "validation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "validation_rules_entity_idx" ON "public"."validation_rules"("entity");

-- CreateIndex
CREATE INDEX "validation_rules_created_by_idx" ON "public"."validation_rules"("created_by");

-- CreateIndex
CREATE UNIQUE INDEX "validation_rules_entity_key" ON "public"."validation_rules"("entity");

-- AddForeignKey
ALTER TABLE "public"."validation_rules" ADD CONSTRAINT "validation_rules_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
