DO $$ BEGIN
  CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'ARCHIVED', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Tenant"
  ADD COLUMN IF NOT EXISTS "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "closedAt" TIMESTAMP(3);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'Tenant'
      AND column_name = 'status'
      AND udt_name <> 'TenantStatus'
  ) THEN
    ALTER TABLE "Tenant"
      ALTER COLUMN "status" DROP DEFAULT,
      ALTER COLUMN "status" TYPE "TenantStatus"
      USING (
        CASE UPPER(COALESCE("status"::text, 'ACTIVE'))
          WHEN 'ARCHIVED' THEN 'ARCHIVED'::"TenantStatus"
          WHEN 'CLOSED' THEN 'CLOSED'::"TenantStatus"
          ELSE 'ACTIVE'::"TenantStatus"
        END
      ),
      ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
  END IF;
END $$;
