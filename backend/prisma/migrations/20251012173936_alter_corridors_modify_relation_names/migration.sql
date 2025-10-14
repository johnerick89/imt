-- DropForeignKey
ALTER TABLE "public"."corridors" DROP CONSTRAINT IF EXISTS "corridors_base_currency_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."corridors" DROP CONSTRAINT IF EXISTS "corridors_destination_country_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."corridors" DROP CONSTRAINT IF EXISTS "corridors_organisation_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."corridors" DROP CONSTRAINT IF EXISTS "corridors_origin_country_id_fkey";

-- Add missing columns (use IF NOT EXISTS to skip if already present)
ALTER TABLE "public"."corridors" ADD COLUMN IF NOT EXISTS "origin_country_id" UUID;
ALTER TABLE "public"."corridors" ADD COLUMN IF NOT EXISTS "destination_currency_id" UUID;
ALTER TABLE "public"."corridors" ADD COLUMN IF NOT EXISTS "destination_organisation_id" UUID;
ALTER TABLE "public"."corridors" ADD COLUMN IF NOT EXISTS "origin_currency_id" UUID;


-- AlterTable
ALTER TABLE "public"."corridors" 
ALTER COLUMN "origin_country_id" DROP NOT NULL,
ALTER COLUMN "destination_country_id" DROP NOT NULL,
ALTER COLUMN "base_currency_id" DROP NOT NULL,
ALTER COLUMN "organisation_id" DROP NOT NULL;

DO $$
BEGIN
  -- For base_country_id (already exists in table)

  -- For origin_country_id (now added)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'corridors_origin_country_id_fkey') THEN
    ALTER TABLE "public"."corridors" ADD CONSTRAINT "corridors_origin_country_id_fkey" 
    FOREIGN KEY ("origin_country_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- For destination_country_id (already exists)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'corridors_destination_country_id_fkey') THEN
    ALTER TABLE "public"."corridors" ADD CONSTRAINT "corridors_destination_country_id_fkey" 
    FOREIGN KEY ("destination_country_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- For origin_currency_id (new)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'corridors_origin_currency_id_fkey') THEN
    ALTER TABLE "public"."corridors" ADD CONSTRAINT "corridors_origin_currency_id_fkey" 
    FOREIGN KEY ("origin_currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- For destination_currency_id (new)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'corridors_destination_currency_id_fkey') THEN
    ALTER TABLE "public"."corridors" ADD CONSTRAINT "corridors_destination_currency_id_fkey" 
    FOREIGN KEY ("destination_currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- For base_currency_id (already exists)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'corridors_base_currency_id_fkey') THEN
    ALTER TABLE "public"."corridors" ADD CONSTRAINT "corridors_base_currency_id_fkey" 
    FOREIGN KEY ("base_currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- For organisation_id (already exists)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'corridors_organisation_id_fkey') THEN
    ALTER TABLE "public"."corridors" ADD CONSTRAINT "corridors_organisation_id_fkey" 
    FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  -- For destination_organisation_id (new)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'corridors_destination_organisation_id_fkey') THEN
    ALTER TABLE "public"."corridors" ADD CONSTRAINT "corridors_destination_organisation_id_fkey" 
    FOREIGN KEY ("destination_organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;