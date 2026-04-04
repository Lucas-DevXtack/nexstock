DO $$ BEGIN
  CREATE TYPE "BillingProvider" AS ENUM ('MERCADO_PAGO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "BillingStatus" AS ENUM ('INACTIVE', 'PENDING', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "BillingInterval" AS ENUM ('MONTH');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELED', 'REFUNDED', 'CHARGED_BACK', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "billingProvider" "BillingProvider";
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "billingCustomerId" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "billingSubscriptionId" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "billingExternalRef" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "billingStatus" "BillingStatus" NOT NULL DEFAULT 'INACTIVE';
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "billingInterval" "BillingInterval";
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "billingCheckoutUrl" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "billingCurrentPeriodEnd" TIMESTAMP(3);
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "billingTrialEndsAt" TIMESTAMP(3);
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "billingTrialUsedAt" TIMESTAMP(3);
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "billingLastEventAt" TIMESTAMP(3);

DO $$ BEGIN
  CREATE UNIQUE INDEX "Tenant_billingCustomerId_key" ON "Tenant"("billingCustomerId");
EXCEPTION
  WHEN duplicate_table THEN null;
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX "Tenant_billingSubscriptionId_key" ON "Tenant"("billingSubscriptionId");
EXCEPTION
  WHEN duplicate_table THEN null;
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX "Tenant_billingExternalRef_key" ON "Tenant"("billingExternalRef");
EXCEPTION
  WHEN duplicate_table THEN null;
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "BillingSubscription" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "provider" "BillingProvider" NOT NULL,
  "providerCustomerId" TEXT,
  "providerSubscriptionId" TEXT,
  "providerCheckoutId" TEXT,
  "providerPlanCode" "Plan" NOT NULL,
  "interval" "BillingInterval" NOT NULL DEFAULT 'MONTH',
  "status" "BillingStatus" NOT NULL DEFAULT 'PENDING',
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'BRL',
  "checkoutUrl" TEXT,
  "checkoutExpiresAt" TIMESTAMP(3),
  "currentPeriodStart" TIMESTAMP(3),
  "currentPeriodEnd" TIMESTAMP(3),
  "approvedAt" TIMESTAMP(3),
  "canceledAt" TIMESTAMP(3),
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BillingSubscription_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BillingSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "BillingPayment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "subscriptionId" TEXT,
  "provider" "BillingProvider" NOT NULL,
  "providerPaymentId" TEXT NOT NULL,
  "providerOrderId" TEXT,
  "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  "amount" DECIMAL(12,2) NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'BRL',
  "paymentMethod" TEXT,
  "approvedAt" TIMESTAMP(3),
  "rejectedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3),
  "rawPayload" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BillingPayment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BillingPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "BillingPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "BillingSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "BillingWebhookEvent" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT,
  "provider" "BillingProvider" NOT NULL,
  "eventType" TEXT NOT NULL,
  "providerEventId" TEXT,
  "resourceId" TEXT,
  "processed" BOOLEAN NOT NULL DEFAULT false,
  "payload" JSONB,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "processedAt" TIMESTAMP(3),
  CONSTRAINT "BillingWebhookEvent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "BillingWebhookEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

DO $$ BEGIN
  CREATE INDEX "BillingSubscription_tenantId_createdAt_idx" ON "BillingSubscription"("tenantId", "createdAt");
EXCEPTION
  WHEN duplicate_table THEN null;
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE INDEX "BillingSubscription_provider_providerSubscriptionId_idx" ON "BillingSubscription"("provider", "providerSubscriptionId");
EXCEPTION
  WHEN duplicate_table THEN null;
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX "BillingPayment_providerPaymentId_key" ON "BillingPayment"("providerPaymentId");
EXCEPTION
  WHEN duplicate_table THEN null;
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE INDEX "BillingPayment_tenantId_createdAt_idx" ON "BillingPayment"("tenantId", "createdAt");
EXCEPTION
  WHEN duplicate_table THEN null;
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE INDEX "BillingPayment_subscriptionId_idx" ON "BillingPayment"("subscriptionId");
EXCEPTION
  WHEN duplicate_table THEN null;
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE UNIQUE INDEX "BillingWebhookEvent_provider_eventType_providerEventId_key" ON "BillingWebhookEvent"("provider", "eventType", "providerEventId");
EXCEPTION
  WHEN duplicate_table THEN null;
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE INDEX "BillingWebhookEvent_tenantId_createdAt_idx" ON "BillingWebhookEvent"("tenantId", "createdAt");
EXCEPTION
  WHEN duplicate_table THEN null;
  WHEN duplicate_object THEN null;
END $$;
