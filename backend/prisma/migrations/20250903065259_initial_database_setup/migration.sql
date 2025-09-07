-- CreateEnum
CREATE TYPE "public"."UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."OrganisationType" AS ENUM ('PARTNER', 'AGENCY', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "public"."IntegrationMethod" AS ENUM ('INTERNAL', 'EXTERNAL');

-- CreateEnum
CREATE TYPE "public"."OrganisationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."IntegrationType" AS ENUM ('API', 'WEBHOOK', 'EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "public"."IntegrationStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."CorridorStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."ApplicationMethod" AS ENUM ('PERCENTAGE', 'FIXED');

-- CreateEnum
CREATE TYPE "public"."ChargeType" AS ENUM ('TAX', 'INTERNAL_FEE', 'COMMISSION', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ApplicableDirection" AS ENUM ('OUTBOUND', 'INBOUND', 'BOTH');

-- CreateEnum
CREATE TYPE "public"."ChargeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."TaxNumberType" AS ENUM ('PIN', 'TIN', 'SSN', 'KRA_PIN', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CustomerType" AS ENUM ('INDIVIDUAL', 'CORPORATE', 'BUSINESS');

-- CreateEnum
CREATE TYPE "public"."IndividualIDType" AS ENUM ('PASSPORT', 'NATIONAL_ID', 'DRIVERS_LICENSE', 'ALIEN_CARD', 'KRA_PIN', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."CustomerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."OwnershipType" AS ENUM ('DIRECT', 'INDIRECT', 'CONTROL', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."RelationshipType" AS ENUM ('OWNER', 'SHAREHOLDER', 'DIRECTOR', 'TRUSTEE', 'PARTNER', 'BENEFICIARY', 'NOMINEE', 'OTHER');

-- CreateEnum
CREATE TYPE "public"."ExchangeRateStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'INACTIVE', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."ExchangeRateOperatorStatus" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "public"."TillStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING', 'BLOCKED');

-- CreateEnum
CREATE TYPE "public"."Direction" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'PENDING', 'FAILED', 'CANCELLED', 'REJECTED', 'COMPLETED', 'REVERSED');

-- CreateEnum
CREATE TYPE "public"."RemittanceStatus" AS ENUM ('PENDING', 'FAILED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."RequestStatus" AS ENUM ('UNDER_REVIEW', 'PENDING_OPERATIONS_APPROVAL', 'PENDING_CUSTOMER_ACTION', 'PENDING_VERIFICATION');

-- CreateEnum
CREATE TYPE "public"."TransactionChargeStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'PAID', 'REVERSED');

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
    "organisation_id" UUID,
    "last_login" TIMESTAMP(3),
    "created_by" UUID,
    "role_id" UUID,
    "branch_id" UUID,

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
    "created_by" UUID,

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
    "created_by" UUID,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

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
    "user_id" UUID,
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

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."permissions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "description" TEXT,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."role_permissions" (
    "id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."branches" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country_id" UUID NOT NULL,
    "zip_code" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "organisation_id" UUID NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaction_channels" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "direction" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."corridors" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "base_country_id" UUID NOT NULL,
    "destination_country_id" UUID NOT NULL,
    "base_currency_id" UUID NOT NULL,
    "organisation_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "public"."CorridorStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "corridors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."charges" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "application_method" "public"."ApplicationMethod" NOT NULL DEFAULT 'PERCENTAGE',
    "currency_id" UUID,
    "type" "public"."ChargeType" NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "origin_organisation_id" UUID,
    "destination_organisation_id" UUID,
    "is_reversible" BOOLEAN NOT NULL DEFAULT false,
    "direction" "public"."ApplicableDirection" NOT NULL DEFAULT 'OUTBOUND',
    "origin_share_percentage" DOUBLE PRECISION,
    "destination_share_percentage" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "public"."ChargeStatus" NOT NULL DEFAULT 'ACTIVE',
    "min_amount" DOUBLE PRECISION,
    "max_amount" DOUBLE PRECISION,

    CONSTRAINT "charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."customers" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "nationality_id" UUID,
    "residence_country_id" UUID,
    "id_type" "public"."IndividualIDType",
    "id_number" TEXT,
    "address" TEXT,
    "email" TEXT,
    "phone_number" TEXT,
    "occupation_id" UUID,
    "registration_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "risk_rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "risk_reasons" TEXT,
    "organisation_id" UUID NOT NULL,
    "branch_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "tax_number_type" "public"."TaxNumberType",
    "tax_number" TEXT,
    "gender" "public"."Gender",
    "customer_type" "public"."CustomerType" NOT NULL,
    "incorporation_country_id" UUID,
    "incoporated_date" TIMESTAMP(3),
    "estimated_monthly_income" DECIMAL(65,30),
    "org_reg_number" TEXT,
    "current_age" INTEGER,
    "first_name" TEXT,
    "last_name" TEXT,
    "currency_id" UUID,
    "industry_id" UUID,
    "legacy_customer_id" TEXT,
    "has_adverse_media" BOOLEAN DEFAULT false,
    "adverse_media_reason" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "status" "public"."CustomerStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."occupations" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "occupations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."industries" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "industries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."beneficiaries" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "organisation_id" UUID NOT NULL,
    "type" "public"."CustomerType" NOT NULL,
    "risk_contribution" DOUBLE PRECISION,
    "risk_contribution_details" JSONB,
    "name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3),
    "nationality_id" UUID,
    "residence_country_id" UUID,
    "incorporation_country_id" UUID,
    "address" TEXT,
    "id_type" "public"."IndividualIDType",
    "id_number" TEXT,
    "tax_number_type" "public"."TaxNumberType",
    "tax_number" TEXT,
    "reg_number" TEXT,
    "occupation_id" UUID,
    "industry_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_by" UUID,
    "status" "public"."CustomerStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "beneficiaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."exchange_rates" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(256),
    "from_currency_id" UUID,
    "to_currency_id" UUID,
    "origin_country_id" UUID,
    "destination_country_id" UUID,
    "buy_rate" DECIMAL(18,9) NOT NULL,
    "sell_rate" DECIMAL(18,9) NOT NULL,
    "exchange_rate" DECIMAL(18,9) NOT NULL,
    "min_buy_rate" DECIMAL(18,9),
    "max_buy_rate" DECIMAL(18,9),
    "min_sell_rate" DECIMAL(18,9),
    "max_sell_rate" DECIMAL(18,9),
    "min_exchange_rate" DECIMAL(18,9),
    "max_exchange_rate" DECIMAL(18,9),
    "status" "public"."ExchangeRateStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "operator_status" "public"."ExchangeRateOperatorStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "approved_by" UUID,
    "created_by" UUID,
    "organisation_id" UUID,
    "created_at" TIMESTAMP(0),
    "updated_at" TIMESTAMP(0),
    "deleted_at" TIMESTAMP(0),

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tills" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "public"."TillStatus" NOT NULL DEFAULT 'ACTIVE',
    "current_teller_user_id" UUID,
    "opened_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transactions" (
    "id" UUID NOT NULL,
    "transaction_no" VARCHAR(128),
    "corridor_id" UUID NOT NULL,
    "till_id" UUID NOT NULL,
    "direction" "public"."Direction" NOT NULL,
    "customer_id" UUID NOT NULL,
    "origin_amount" DECIMAL(22,9) NOT NULL,
    "origin_channel_id" UUID NOT NULL,
    "origin_currency_id" UUID NOT NULL,
    "beneficiary_id" UUID NOT NULL,
    "dest_amount" DECIMAL(22,9) NOT NULL,
    "dest_channel_id" UUID NOT NULL,
    "dest_currency_id" UUID NOT NULL,
    "rate" DECIMAL(22,9) NOT NULL,
    "internal_exchange_rate" DECIMAL(18,9),
    "inflation" DECIMAL(18,9),
    "markup" DECIMAL(18,9),
    "purpose" VARCHAR(256),
    "funds_source" VARCHAR(256),
    "relationship" VARCHAR(256),
    "remarks" VARCHAR(1024),
    "status" "public"."Status" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "remittance_status" "public"."RemittanceStatus" NOT NULL DEFAULT 'PENDING',
    "remittance_status_details" VARCHAR(1024),
    "request_status" "public"."RequestStatus" NOT NULL DEFAULT 'UNDER_REVIEW',
    "remitted_at" TIMESTAMP(3),
    "exchange_rate_id" BIGINT,
    "external_exchange_rate_id" BIGINT,
    "created_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "received_at" TIMESTAMP(3),
    "amount_payable" DECIMAL(22,9),
    "amount_receivable" DECIMAL(22,9),
    "origin_organisation_id" UUID,
    "destination_organisation_id" UUID,
    "integration_id" UUID,
    "total_taxes" DECIMAL(22,9),
    "internal_charges" DECIMAL(22,9),
    "commissions" DECIMAL(22,9),
    "reversal_status" TEXT,
    "reversal_date" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."transaction_charges" (
    "id" UUID NOT NULL,
    "transaction_id" UUID NOT NULL,
    "type" "public"."ChargeType" NOT NULL,
    "amount" DECIMAL(22,9) NOT NULL,
    "rate" DECIMAL(18,9),
    "is_reversible" BOOLEAN NOT NULL DEFAULT true,
    "description" VARCHAR(256),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "public"."TransactionChargeStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "transaction_charges_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "users_created_by_idx" ON "public"."users"("created_by");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "public"."users"("role_id");

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
CREATE INDEX "roles_name_idx" ON "public"."roles"("name");

-- CreateIndex
CREATE INDEX "roles_created_at_idx" ON "public"."roles"("created_at");

-- CreateIndex
CREATE INDEX "roles_updated_at_idx" ON "public"."roles"("updated_at");

-- CreateIndex
CREATE INDEX "roles_created_by_idx" ON "public"."roles"("created_by");

-- CreateIndex
CREATE INDEX "permissions_name_idx" ON "public"."permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "public"."permissions"("name");

-- CreateIndex
CREATE INDEX "role_permissions_role_id_idx" ON "public"."role_permissions"("role_id");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "public"."role_permissions"("permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "public"."role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE INDEX "branches_name_idx" ON "public"."branches"("name");

-- CreateIndex
CREATE INDEX "branches_organisation_id_idx" ON "public"."branches"("organisation_id");

-- CreateIndex
CREATE UNIQUE INDEX "branches_name_organisation_id_key" ON "public"."branches"("name", "organisation_id");

-- CreateIndex
CREATE INDEX "transaction_channels_created_at_idx" ON "public"."transaction_channels"("created_at");

-- CreateIndex
CREATE INDEX "transaction_channels_updated_at_idx" ON "public"."transaction_channels"("updated_at");

-- CreateIndex
CREATE INDEX "transaction_channels_created_by_idx" ON "public"."transaction_channels"("created_by");

-- CreateIndex
CREATE INDEX "corridors_name_idx" ON "public"."corridors"("name");

-- CreateIndex
CREATE INDEX "corridors_base_country_id_idx" ON "public"."corridors"("base_country_id");

-- CreateIndex
CREATE INDEX "corridors_destination_country_id_idx" ON "public"."corridors"("destination_country_id");

-- CreateIndex
CREATE INDEX "corridors_base_currency_id_idx" ON "public"."corridors"("base_currency_id");

-- CreateIndex
CREATE INDEX "corridors_status_idx" ON "public"."corridors"("status");

-- CreateIndex
CREATE INDEX "charges_name_idx" ON "public"."charges"("name");

-- CreateIndex
CREATE INDEX "charges_currency_id_idx" ON "public"."charges"("currency_id");

-- CreateIndex
CREATE INDEX "charges_origin_organisation_id_idx" ON "public"."charges"("origin_organisation_id");

-- CreateIndex
CREATE INDEX "charges_destination_organisation_id_idx" ON "public"."charges"("destination_organisation_id");

-- CreateIndex
CREATE INDEX "charges_status_idx" ON "public"."charges"("status");

-- CreateIndex
CREATE INDEX "charges_created_at_idx" ON "public"."charges"("created_at");

-- CreateIndex
CREATE INDEX "charges_updated_at_idx" ON "public"."charges"("updated_at");

-- CreateIndex
CREATE INDEX "customers_full_name_idx" ON "public"."customers"("full_name");

-- CreateIndex
CREATE INDEX "customers_id_type_id_number_idx" ON "public"."customers"("id_type", "id_number");

-- CreateIndex
CREATE INDEX "customers_nationality_id_idx" ON "public"."customers"("nationality_id");

-- CreateIndex
CREATE INDEX "customers_residence_country_id_idx" ON "public"."customers"("residence_country_id");

-- CreateIndex
CREATE INDEX "customers_email_idx" ON "public"."customers"("email");

-- CreateIndex
CREATE INDEX "customers_phone_number_idx" ON "public"."customers"("phone_number");

-- CreateIndex
CREATE INDEX "customers_occupation_id_idx" ON "public"."customers"("occupation_id");

-- CreateIndex
CREATE INDEX "customers_registration_date_idx" ON "public"."customers"("registration_date");

-- CreateIndex
CREATE INDEX "customers_risk_rating_idx" ON "public"."customers"("risk_rating");

-- CreateIndex
CREATE INDEX "customers_organisation_id_idx" ON "public"."customers"("organisation_id");

-- CreateIndex
CREATE INDEX "customers_branch_id_idx" ON "public"."customers"("branch_id");

-- CreateIndex
CREATE INDEX "customers_tax_number_type_idx" ON "public"."customers"("tax_number_type");

-- CreateIndex
CREATE INDEX "customers_tax_number_idx" ON "public"."customers"("tax_number");

-- CreateIndex
CREATE INDEX "customers_gender_idx" ON "public"."customers"("gender");

-- CreateIndex
CREATE INDEX "customers_customer_type_idx" ON "public"."customers"("customer_type");

-- CreateIndex
CREATE INDEX "customers_incorporation_country_id_idx" ON "public"."customers"("incorporation_country_id");

-- CreateIndex
CREATE INDEX "customers_incoporated_date_idx" ON "public"."customers"("incoporated_date");

-- CreateIndex
CREATE INDEX "customers_status_idx" ON "public"."customers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "customers_id_type_id_number_organisation_id_key" ON "public"."customers"("id_type", "id_number", "organisation_id");

-- CreateIndex
CREATE INDEX "occupations_created_at_idx" ON "public"."occupations"("created_at");

-- CreateIndex
CREATE INDEX "occupations_updated_at_idx" ON "public"."occupations"("updated_at");

-- CreateIndex
CREATE INDEX "industries_created_at_idx" ON "public"."industries"("created_at");

-- CreateIndex
CREATE INDEX "industries_updated_at_idx" ON "public"."industries"("updated_at");

-- CreateIndex
CREATE INDEX "beneficiaries_customer_id_idx" ON "public"."beneficiaries"("customer_id");

-- CreateIndex
CREATE INDEX "beneficiaries_organisation_id_idx" ON "public"."beneficiaries"("organisation_id");

-- CreateIndex
CREATE INDEX "beneficiaries_deleted_at_idx" ON "public"."beneficiaries"("deleted_at");

-- CreateIndex
CREATE INDEX "beneficiaries_name_idx" ON "public"."beneficiaries"("name");

-- CreateIndex
CREATE INDEX "beneficiaries_id_type_id_number_idx" ON "public"."beneficiaries"("id_type", "id_number");

-- CreateIndex
CREATE INDEX "beneficiaries_nationality_id_idx" ON "public"."beneficiaries"("nationality_id");

-- CreateIndex
CREATE INDEX "beneficiaries_residence_country_id_idx" ON "public"."beneficiaries"("residence_country_id");

-- CreateIndex
CREATE INDEX "beneficiaries_tax_number_type_idx" ON "public"."beneficiaries"("tax_number_type");

-- CreateIndex
CREATE INDEX "beneficiaries_tax_number_idx" ON "public"."beneficiaries"("tax_number");

-- CreateIndex
CREATE INDEX "beneficiaries_reg_number_idx" ON "public"."beneficiaries"("reg_number");

-- CreateIndex
CREATE INDEX "beneficiaries_occupation_id_idx" ON "public"."beneficiaries"("occupation_id");

-- CreateIndex
CREATE INDEX "beneficiaries_industry_id_idx" ON "public"."beneficiaries"("industry_id");

-- CreateIndex
CREATE UNIQUE INDEX "beneficiaries_customer_id_organisation_id_key" ON "public"."beneficiaries"("customer_id", "organisation_id");

-- CreateIndex
CREATE INDEX "exchange_rates_from_currency_id_idx" ON "public"."exchange_rates"("from_currency_id");

-- CreateIndex
CREATE INDEX "exchange_rates_to_currency_id_idx" ON "public"."exchange_rates"("to_currency_id");

-- CreateIndex
CREATE INDEX "exchange_rates_origin_country_id_idx" ON "public"."exchange_rates"("origin_country_id");

-- CreateIndex
CREATE INDEX "exchange_rates_destination_country_id_idx" ON "public"."exchange_rates"("destination_country_id");

-- CreateIndex
CREATE INDEX "exchange_rates_approved_by_idx" ON "public"."exchange_rates"("approved_by");

-- CreateIndex
CREATE INDEX "exchange_rates_created_by_idx" ON "public"."exchange_rates"("created_by");

-- CreateIndex
CREATE INDEX "exchange_rates_organisation_id_idx" ON "public"."exchange_rates"("organisation_id");

-- CreateIndex
CREATE INDEX "tills_created_at_idx" ON "public"."tills"("created_at");

-- CreateIndex
CREATE INDEX "tills_updated_at_idx" ON "public"."tills"("updated_at");

-- CreateIndex
CREATE INDEX "tills_status_idx" ON "public"."tills"("status");

-- CreateIndex
CREATE INDEX "tills_current_teller_user_id_idx" ON "public"."tills"("current_teller_user_id");

-- CreateIndex
CREATE INDEX "tills_opened_at_idx" ON "public"."tills"("opened_at");

-- CreateIndex
CREATE INDEX "tills_closed_at_idx" ON "public"."tills"("closed_at");

-- CreateIndex
CREATE INDEX "transactions_corridor_id_idx" ON "public"."transactions"("corridor_id");

-- CreateIndex
CREATE INDEX "transactions_till_id_idx" ON "public"."transactions"("till_id");

-- CreateIndex
CREATE INDEX "transactions_origin_channel_id_idx" ON "public"."transactions"("origin_channel_id");

-- CreateIndex
CREATE INDEX "transactions_origin_currency_id_idx" ON "public"."transactions"("origin_currency_id");

-- CreateIndex
CREATE INDEX "transactions_beneficiary_id_idx" ON "public"."transactions"("beneficiary_id");

-- CreateIndex
CREATE INDEX "transactions_customer_id_idx" ON "public"."transactions"("customer_id");

-- CreateIndex
CREATE INDEX "transactions_dest_channel_id_idx" ON "public"."transactions"("dest_channel_id");

-- CreateIndex
CREATE INDEX "transactions_dest_currency_id_idx" ON "public"."transactions"("dest_currency_id");

-- CreateIndex
CREATE INDEX "transactions_exchange_rate_id_idx" ON "public"."transactions"("exchange_rate_id");

-- CreateIndex
CREATE INDEX "transactions_external_exchange_rate_id_idx" ON "public"."transactions"("external_exchange_rate_id");

-- CreateIndex
CREATE INDEX "transactions_created_by_idx" ON "public"."transactions"("created_by");

-- CreateIndex
CREATE INDEX "transactions_origin_organisation_id_idx" ON "public"."transactions"("origin_organisation_id");

-- CreateIndex
CREATE INDEX "transactions_destination_organisation_id_idx" ON "public"."transactions"("destination_organisation_id");

-- CreateIndex
CREATE INDEX "transactions_integration_id_idx" ON "public"."transactions"("integration_id");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "public"."transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_remittance_status_idx" ON "public"."transactions"("remittance_status");

-- CreateIndex
CREATE INDEX "transactions_request_status_idx" ON "public"."transactions"("request_status");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "public"."transactions"("created_at");

-- CreateIndex
CREATE INDEX "transactions_updated_at_idx" ON "public"."transactions"("updated_at");

-- CreateIndex
CREATE INDEX "transactions_deleted_at_idx" ON "public"."transactions"("deleted_at");

-- CreateIndex
CREATE INDEX "transactions_received_at_idx" ON "public"."transactions"("received_at");

-- CreateIndex
CREATE INDEX "transactions_remitted_at_idx" ON "public"."transactions"("remitted_at");

-- CreateIndex
CREATE INDEX "transactions_reversal_date_idx" ON "public"."transactions"("reversal_date");

-- CreateIndex
CREATE INDEX "transaction_charges_transaction_id_idx" ON "public"."transaction_charges"("transaction_id");

-- CreateIndex
CREATE INDEX "transaction_charges_type_idx" ON "public"."transaction_charges"("type");

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."users" ADD CONSTRAINT "users_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."countries" ADD CONSTRAINT "countries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organisations" ADD CONSTRAINT "organisations_base_currency_id_fkey" FOREIGN KEY ("base_currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organisations" ADD CONSTRAINT "organisations_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organisations" ADD CONSTRAINT "organisations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."integrations" ADD CONSTRAINT "integrations_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."integrations" ADD CONSTRAINT "integrations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_activities" ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_activities" ADD CONSTRAINT "user_activities_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."roles" ADD CONSTRAINT "roles_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."branches" ADD CONSTRAINT "branches_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."branches" ADD CONSTRAINT "branches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."branches" ADD CONSTRAINT "branches_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_channels" ADD CONSTRAINT "transaction_channels_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."corridors" ADD CONSTRAINT "corridors_base_country_id_fkey" FOREIGN KEY ("base_country_id") REFERENCES "public"."countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."corridors" ADD CONSTRAINT "corridors_destination_country_id_fkey" FOREIGN KEY ("destination_country_id") REFERENCES "public"."countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."corridors" ADD CONSTRAINT "corridors_base_currency_id_fkey" FOREIGN KEY ("base_currency_id") REFERENCES "public"."currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."corridors" ADD CONSTRAINT "corridors_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."corridors" ADD CONSTRAINT "corridors_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charges" ADD CONSTRAINT "charges_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charges" ADD CONSTRAINT "charges_origin_organisation_id_fkey" FOREIGN KEY ("origin_organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charges" ADD CONSTRAINT "charges_destination_organisation_id_fkey" FOREIGN KEY ("destination_organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."charges" ADD CONSTRAINT "charges_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_nationality_id_fkey" FOREIGN KEY ("nationality_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_residence_country_id_fkey" FOREIGN KEY ("residence_country_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_occupation_id_fkey" FOREIGN KEY ("occupation_id") REFERENCES "public"."occupations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "public"."branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_incorporation_country_id_fkey" FOREIGN KEY ("incorporation_country_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_currency_id_fkey" FOREIGN KEY ("currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."customers" ADD CONSTRAINT "customers_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beneficiaries" ADD CONSTRAINT "beneficiaries_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beneficiaries" ADD CONSTRAINT "beneficiaries_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beneficiaries" ADD CONSTRAINT "beneficiaries_nationality_id_fkey" FOREIGN KEY ("nationality_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beneficiaries" ADD CONSTRAINT "beneficiaries_residence_country_id_fkey" FOREIGN KEY ("residence_country_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beneficiaries" ADD CONSTRAINT "beneficiaries_incorporation_country_id_fkey" FOREIGN KEY ("incorporation_country_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beneficiaries" ADD CONSTRAINT "beneficiaries_occupation_id_fkey" FOREIGN KEY ("occupation_id") REFERENCES "public"."occupations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beneficiaries" ADD CONSTRAINT "beneficiaries_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."beneficiaries" ADD CONSTRAINT "beneficiaries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exchange_rates" ADD CONSTRAINT "exchange_rates_from_currency_id_fkey" FOREIGN KEY ("from_currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exchange_rates" ADD CONSTRAINT "exchange_rates_to_currency_id_fkey" FOREIGN KEY ("to_currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exchange_rates" ADD CONSTRAINT "exchange_rates_origin_country_id_fkey" FOREIGN KEY ("origin_country_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exchange_rates" ADD CONSTRAINT "exchange_rates_destination_country_id_fkey" FOREIGN KEY ("destination_country_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exchange_rates" ADD CONSTRAINT "exchange_rates_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exchange_rates" ADD CONSTRAINT "exchange_rates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."exchange_rates" ADD CONSTRAINT "exchange_rates_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tills" ADD CONSTRAINT "tills_current_teller_user_id_fkey" FOREIGN KEY ("current_teller_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_corridor_id_fkey" FOREIGN KEY ("corridor_id") REFERENCES "public"."corridors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_till_id_fkey" FOREIGN KEY ("till_id") REFERENCES "public"."tills"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_origin_channel_id_fkey" FOREIGN KEY ("origin_channel_id") REFERENCES "public"."transaction_channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_origin_currency_id_fkey" FOREIGN KEY ("origin_currency_id") REFERENCES "public"."currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_beneficiary_id_fkey" FOREIGN KEY ("beneficiary_id") REFERENCES "public"."beneficiaries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_dest_channel_id_fkey" FOREIGN KEY ("dest_channel_id") REFERENCES "public"."transaction_channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_dest_currency_id_fkey" FOREIGN KEY ("dest_currency_id") REFERENCES "public"."currencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_exchange_rate_id_fkey" FOREIGN KEY ("exchange_rate_id") REFERENCES "public"."exchange_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_external_exchange_rate_id_fkey" FOREIGN KEY ("external_exchange_rate_id") REFERENCES "public"."exchange_rates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_origin_organisation_id_fkey" FOREIGN KEY ("origin_organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_destination_organisation_id_fkey" FOREIGN KEY ("destination_organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transactions" ADD CONSTRAINT "transactions_integration_id_fkey" FOREIGN KEY ("integration_id") REFERENCES "public"."integrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."transaction_charges" ADD CONSTRAINT "transaction_charges_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
