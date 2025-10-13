-- DropForeignKey (already idempotent with IF EXISTS)
ALTER TABLE "public"."corridors" DROP CONSTRAINT IF EXISTS "corridors_base_currency_id_fkey";
ALTER TABLE "public"."corridors" DROP CONSTRAINT IF EXISTS "corridors_destination_country_id_fkey";
ALTER TABLE "public"."corridors" DROP CONSTRAINT IF EXISTS "corridors_organisation_id_fkey";
ALTER TABLE "public"."corridors" DROP CONSTRAINT IF EXISTS "corridors_origin_country_id_fkey";

-- Add missing columns only (base_country_id and destination_country_id already exist, so skip them)
-- Add origin_country_id (missing from current table)
ALTER TABLE "public"."corridors" ADD COLUMN IF NOT EXISTS "origin_country_id" UUID;

-- Add the other new columns
ALTER TABLE "public"."corridors" ADD COLUMN IF NOT EXISTS "destination_currency_id" UUID;
ALTER TABLE "public"."corridors" ADD COLUMN IF NOT EXISTS "destination_organisation_id" UUID;
ALTER TABLE "public"."corridors" ADD COLUMN IF NOT EXISTS "origin_currency_id" UUID;

-- Drop NOT NULL constraints on relevant columns (only if they exist and are NOT NULL)
-- Use a DO block for conditional execution
DO $$
BEGIN
  -- origin_country_id (newly added, default NULL, so skip if already NULLable)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'corridors' AND column_name = 'origin_country_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "public"."corridors" ALTER COLUMN "origin_country_id" DROP NOT NULL;
  END IF;

  -- destination_country_id (exists, drop if NOT NULL)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'corridors' AND column_name = 'destination_country_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "public"."corridors" ALTER COLUMN "destination_country_id" DROP NOT NULL;
  END IF;

  -- base_currency_id (exists, drop if NOT NULL)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'corridors' AND column_name = 'base_currency_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "public"."corridors" ALTER COLUMN "base_currency_id" DROP NOT NULL;
  END IF;

  -- organisation_id (exists, drop if NOT NULL)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'corridors' AND column_name = 'organisation_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE "public"."corridors" ALTER COLUMN "organisation_id" DROP NOT NULL;
  END IF;
END $$;

-- AddForeignKey (idempotent with IF NOT EXISTS for constraints)
-- For base_country_id (already exists)
ALTER TABLE "public"."corridors" 
ADD CONSTRAINT IF NOT EXISTS "corridors_base_country_id_fkey" 
FOREIGN KEY ("base_country_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- For origin_country_id (newly added or existing)
ALTER TABLE "public"."corridors" 
ADD CONSTRAINT IF NOT EXISTS "corridors_origin_country_id_fkey" 
FOREIGN KEY ("origin_country_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- For destination_country_id (already exists)
ALTER TABLE "public"."corridors" 
ADD CONSTRAINT IF NOT EXISTS "corridors_destination_country_id_fkey" 
FOREIGN KEY ("destination_country_id") REFERENCES "public"."countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- For origin_currency_id (new)
ALTER TABLE "public"."corridors" 
ADD CONSTRAINT IF NOT EXISTS "corridors_origin_currency_id_fkey" 
FOREIGN KEY ("origin_currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- For destination_currency_id (new)
ALTER TABLE "public"."corridors" 
ADD CONSTRAINT IF NOT EXISTS "corridors_destination_currency_id_fkey" 
FOREIGN KEY ("destination_currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- For base_currency_id (already exists)
ALTER TABLE "public"."corridors" 
ADD CONSTRAINT IF NOT EXISTS "corridors_base_currency_id_fkey" 
FOREIGN KEY ("base_currency_id") REFERENCES "public"."currencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- For organisation_id (already exists)
ALTER TABLE "public"."corridors" 
ADD CONSTRAINT IF NOT EXISTS "corridors_organisation_id_fkey" 
FOREIGN KEY ("organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- For destination_organisation_id (new)
ALTER TABLE "public"."corridors" 
ADD CONSTRAINT IF NOT EXISTS "corridors_destination_organisation_id_fkey" 
FOREIGN KEY ("destination_organisation_id") REFERENCES "public"."organisations"("id") ON DELETE SET NULL ON UPDATE CASCADE;