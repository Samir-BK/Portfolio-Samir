BEGIN;

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "ContentStage" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ProjectVisual" AS ENUM ('queue', 'trace', 'notes');

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectVersion" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "stage" "ContentStage" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "problem" TEXT NOT NULL,
    "approach" TEXT NOT NULL,
    "decisions" TEXT NOT NULL,
    "challenges" TEXT NOT NULL,
    "lessons" TEXT NOT NULL,
    "visual" "ProjectVisual" NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER NOT NULL DEFAULT 0,
    "repositoryUrl" TEXT,
    "demoUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectCategory" (
    "projectVersionId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,

    CONSTRAINT "ProjectCategory_pkey" PRIMARY KEY ("projectVersionId")
);

-- CreateTable
CREATE TABLE "ProjectTechnology" (
    "projectVersionId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ProjectTechnology_pkey" PRIMARY KEY ("projectVersionId","key")
);

-- CreateTable
CREATE TABLE "ProjectMedia" (
    "projectVersionId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,

    CONSTRAINT "ProjectMedia_pkey" PRIMARY KEY ("projectVersionId","position")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "isDemo" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostVersion" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "stage" "ContentStage" NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "markdown" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostTag" (
    "postVersionId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "PostTag_pkey" PRIMARY KEY ("postVersionId","key")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE INDEX "ProjectVersion_stage_featuredOrder_projectId_idx" ON "ProjectVersion"("stage", "featuredOrder", "projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectVersion_projectId_stage_key" ON "ProjectVersion"("projectId", "stage");

-- CreateIndex
CREATE INDEX "ProjectCategory_key_idx" ON "ProjectCategory"("key");

-- CreateIndex
CREATE INDEX "ProjectTechnology_key_idx" ON "ProjectTechnology"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_key" ON "Post"("slug");

-- CreateIndex
CREATE INDEX "PostVersion_stage_publishedAt_postId_idx" ON "PostVersion"("stage", "publishedAt", "postId");

-- CreateIndex
CREATE UNIQUE INDEX "PostVersion_postId_stage_key" ON "PostVersion"("postId", "stage");

-- CreateIndex
CREATE INDEX "PostTag_key_idx" ON "PostTag"("key");

-- AddForeignKey
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectCategory" ADD CONSTRAINT "ProjectCategory_projectVersionId_fkey" FOREIGN KEY ("projectVersionId") REFERENCES "ProjectVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTechnology" ADD CONSTRAINT "ProjectTechnology_projectVersionId_fkey" FOREIGN KEY ("projectVersionId") REFERENCES "ProjectVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMedia" ADD CONSTRAINT "ProjectMedia_projectVersionId_fkey" FOREIGN KEY ("projectVersionId") REFERENCES "ProjectVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostVersion" ADD CONSTRAINT "PostVersion_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostTag" ADD CONSTRAINT "PostTag_postVersionId_fkey" FOREIGN KEY ("postVersionId") REFERENCES "PostVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Snapshot state and media integrity
ALTER TABLE "ProjectVersion" ADD CONSTRAINT "ProjectVersion_valid_publication" CHECK (
    "version" > 0 AND (("stage" = 'PUBLISHED') = ("publishedAt" IS NOT NULL))
);
ALTER TABLE "PostVersion" ADD CONSTRAINT "PostVersion_valid_publication" CHECK (
    "version" > 0 AND (("stage" = 'PUBLISHED') = ("publishedAt" IS NOT NULL))
);
ALTER TABLE "ProjectMedia" ADD CONSTRAINT "ProjectMedia_positive_dimensions" CHECK ("width" > 0 AND "height" > 0);

COMMIT;
