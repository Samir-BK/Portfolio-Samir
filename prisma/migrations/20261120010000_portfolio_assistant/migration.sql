-- CreateTable
CREATE TABLE "AssistantProfilePublication" (
    "id" TEXT NOT NULL,
    "sections" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantProfilePublication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssistantUsageWindow" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantUsageWindow_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AssistantRequestLease" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssistantRequestLease_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssistantUsageWindow_expiresAt_idx" ON "AssistantUsageWindow"("expiresAt");

-- CreateIndex
CREATE INDEX "AssistantRequestLease_expiresAt_idx" ON "AssistantRequestLease"("expiresAt");

