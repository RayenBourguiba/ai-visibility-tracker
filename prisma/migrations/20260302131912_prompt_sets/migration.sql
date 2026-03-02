-- AlterTable
ALTER TABLE "Prompt" ADD COLUMN     "setKey" TEXT NOT NULL DEFAULT 'core';

-- CreateIndex
CREATE INDEX "Prompt_projectId_setKey_idx" ON "Prompt"("projectId", "setKey");
