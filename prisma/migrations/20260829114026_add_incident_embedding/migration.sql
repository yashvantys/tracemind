CREATE EXTENSION IF NOT EXISTS vector;

-- AlterTable
ALTER TABLE "Incident"
ADD COLUMN "embedding" vector(1536);