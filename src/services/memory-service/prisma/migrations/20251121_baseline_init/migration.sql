-- CreateTable
CREATE TABLE "memories" (
    "memory_id" VARCHAR(255) NOT NULL DEFAULT gen_random_uuid(),
    "user_id" VARCHAR(255) NOT NULL,
    "content" TEXT NOT NULL,
    "mem0_memory_id" VARCHAR(255),
    "source_chat_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("memory_id")
);

-- CreateIndex
CREATE INDEX "idx_memories_user_id" ON "memories"("user_id");