-- This migration was reintroduced to match an already-applied database migration.
-- It adds COGS (cost of goods sold) columns to StockMove.
ALTER TABLE "StockMove" ADD COLUMN IF NOT EXISTS "cogsUnit" DECIMAL(14,4);
ALTER TABLE "StockMove" ADD COLUMN IF NOT EXISTS "cogsTotal" DECIMAL(14,4);
