-- Add MoveReason enum + reason field for StockMove

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MoveReason') THEN
    CREATE TYPE "MoveReason" AS ENUM ('SALE','ADJUST','LOSS','TRANSFER','OTHER');
  END IF;
END$$;

ALTER TABLE "StockMove"
  ADD COLUMN IF NOT EXISTS "reason" "MoveReason";

-- Backfill: treat historical OUT moves with unitPrice as SALE
UPDATE "StockMove"
SET "reason" = 'SALE'
WHERE "reason" IS NULL AND "type" = 'OUT' AND "unitPrice" IS NOT NULL;
