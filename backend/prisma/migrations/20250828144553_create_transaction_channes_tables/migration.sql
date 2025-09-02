-- CreateTable
CREATE TABLE "public"."TransactionChannel" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "integration_type" "public"."IntegrationType" NOT NULL,
    "direction" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TransactionChannel_pkey" PRIMARY KEY ("id")
);
