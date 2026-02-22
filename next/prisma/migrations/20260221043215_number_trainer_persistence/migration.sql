-- CreateTable
CREATE TABLE "training_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "trainer_type" TEXT NOT NULL,
    "started_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" DATETIME,
    "summary" JSONB,
    CONSTRAINT "training_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "number_training_rounds" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "target_language" TEXT NOT NULL,
    "sentence_mode" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluated_at" DATETIME,
    CONSTRAINT "number_training_rounds_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "training_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "number_training_rounds_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "training_attempts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "session_id" TEXT NOT NULL,
    "round_id" TEXT,
    "prompt_payload" JSONB NOT NULL,
    "user_input" TEXT NOT NULL,
    "evaluation" JSONB NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "training_attempts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "training_sessions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "training_attempts_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "number_training_rounds" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "training_sessions_user_id_trainer_type_idx" ON "training_sessions"("user_id", "trainer_type");

-- CreateIndex
CREATE INDEX "number_training_rounds_session_id_created_at_idx" ON "number_training_rounds"("session_id", "created_at");

-- CreateIndex
CREATE INDEX "number_training_rounds_user_id_created_at_idx" ON "number_training_rounds"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "training_attempts_round_id_key" ON "training_attempts"("round_id");

-- CreateIndex
CREATE INDEX "training_attempts_session_id_created_at_idx" ON "training_attempts"("session_id", "created_at");
