-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."OrganisationType" AS ENUM ('PARTNER', 'AGENCY', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."IntegrationMethod" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "public"."OrganisationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "avatar" TEXT,
    "status" "public"."UserStatus" NOT NULL DEFAULT 'PENDING',
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "country" TEXT,
    "organisation_id" UUID,
    "last_login" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."currencies" (
    "id" UUID NOT NULL,
    "currency_name" TEXT NOT NULL,
    "currency_code" TEXT NOT NULL,
    "currency_symbol" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "symbol_native" TEXT,
    "decimal_digits" INTEGER,
    "rounding" DOUBLE PRECISION,
    "name_plural" TEXT,

    CONSTRAINT "currencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."countries" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "countries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organisations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "public"."OrganisationType" NOT NULL DEFAULT 'PARTNER',
    "integration_mode" "public"."IntegrationMethod" NOT NULL DEFAULT 'INTERNAL',
    "contact_person" TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "contact_address" TEXT,
    "contact_city" TEXT,
    "contact_state" TEXT,
    "contact_zip" TEXT,
    "status" "public"."OrganisationStatus" NOT NULL DEFAULT 'PENDING',
    "base_currency_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "country_id" UUID,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "public"."users"("email");

-- CreateIndex
CREATE INDEX "users_id_idx" ON "public"."users"("id");

-- CreateIndex
CREATE INDEX "users_first_name_idx" ON "public"."users"("first_name");

-- CreateIndex
CREATE INDEX "users_last_name_idx" ON "public"."users"("last_name");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "public"."users"("status");

-- CreateIndex
CREATE INDEX "users_last_login_idx" ON "public"."users"("last_login");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "public"."users"("created_at");

-- CreateIndex
CREATE INDEX "users_updated_at_idx" ON "public"."users"("updated_at");

-- CreateIndex
CREATE INDEX "users_avatar_idx" ON "public"."users"("avatar");

-- CreateIndex
CREATE INDEX "users_password_idx" ON "public"."users"("password");

-- CreateIndex
CREATE INDEX "currencies_currency_name_idx" ON "public"."currencies"("currency_name");

-- CreateIndex
CREATE INDEX "currencies_currency_code_idx" ON "public"."currencies"("currency_code");

-- CreateIndex
CREATE INDEX "currencies_currency_symbol_idx" ON "public"."currencies"("currency_symbol");

-- CreateIndex
CREATE INDEX "currencies_created_at_idx" ON "public"."currencies"("created_at");

-- CreateIndex
CREATE INDEX "currencies_updated_at_idx" ON "public"."currencies"("updated_at");

-- CreateIndex
CREATE INDEX "countries_name_idx" ON "public"."countries"("name");

-- CreateIndex
CREATE INDEX "countries_code_idx" ON "public"."countries"("code");

-- CreateIndex
CREATE INDEX "countries_created_at_idx" ON "public"."countries"("created_at");

-- CreateIndex
CREATE INDEX "countries_updated_at_idx" ON "public"."countries"("updated_at");

-- CreateIndex
CREATE INDEX "organisations_name_idx" ON "public"."organisations"("name");

-- CreateIndex
CREATE INDEX "organisations_id_idx" ON "public"."organisations"("id");

-- CreateIndex
CREATE INDEX "organisations_description_idx" ON "public"."organisations"("description");

-- CreateIndex
CREATE INDEX "organisations_created_at_idx" ON "public"."organisations"("created_at");

-- CreateIndex
CREATE INDEX "organisations_updated_at_idx" ON "public"."organisations"("updated_at");

-- CreateIndex
CREATE INDEX "organisations_type_idx" ON "public"."organisations"("type");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organisations" ADD CONSTRAINT "organisations_base_currency_id_fkey" FOREIGN KEY ("base_currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organisations" ADD CONSTRAINT "organisations_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
