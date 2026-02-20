import { NextResponse } from "next/server"

import {
  formatDateForInput,
  formatDateForLocale,
  formatDateSpeechText,
  generateDateRound,
  resolveDateDifficulty,
} from "@/lib/trainers/date"

interface DateRoundRequest {
  difficulty?: unknown
  targetLanguage?: unknown
  appLanguage?: unknown
  sentenceMode?: unknown
}

export async function POST(request: Request) {
  let body: DateRoundRequest = {}

  try {
    body = (await request.json()) as DateRoundRequest
  } catch {
    body = {}
  }

  const difficulty = resolveDateDifficulty(body.difficulty)
  const targetLanguage =
    typeof body.targetLanguage === "string" ? body.targetLanguage : "en"
  const appLanguage = typeof body.appLanguage === "string" ? body.appLanguage : "en-US"
  const sentenceMode = Boolean(body.sentenceMode)

  const round = generateDateRound(difficulty)
  const expectedInput = formatDateForInput(round.dateISO, round.format)
  const answerDisplay = formatDateForLocale(round.dateISO, round.format, appLanguage)
  const speechText = formatDateSpeechText({
    dateISO: round.dateISO,
    format: round.format,
    targetLanguage,
    locale: appLanguage,
    sentenceMode,
  })

  return NextResponse.json({
    difficulty,
    targetLanguage,
    appLanguage,
    sentenceMode,
    round: {
      dateISO: round.dateISO,
      format: round.format,
      expectedInput,
      answerDisplay,
      speechText,
    },
  })
}
