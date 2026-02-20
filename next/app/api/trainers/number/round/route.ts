import { NextResponse } from "next/server"

import {
  formatSpokenText,
  generateNumberByDifficulty,
  resolveDifficulty,
} from "@/lib/trainers/number"

interface NumberRoundRequest {
  difficulty?: unknown
  targetLanguage?: unknown
  sentenceMode?: unknown
}

export async function POST(request: Request) {
  let body: NumberRoundRequest = {}

  try {
    body = (await request.json()) as NumberRoundRequest
  } catch {
    body = {}
  }

  const difficulty = resolveDifficulty(body.difficulty)
  const targetLanguage =
    typeof body.targetLanguage === "string" ? body.targetLanguage : "en"
  const sentenceMode = Boolean(body.sentenceMode)

  const number = generateNumberByDifficulty(difficulty)
  const text = formatSpokenText(number, targetLanguage, sentenceMode)

  return NextResponse.json({
    number,
    text,
    difficulty,
    targetLanguage,
    sentenceMode,
  })
}
