import { NextResponse } from "next/server"

import {
  generateComprehensionRound,
  resolveSupportedLanguage,
  resolveTargetLanguageLevel,
} from "@/lib/trainers/comprehension"

interface ComprehensionRoundRequest {
  targetLanguage?: unknown
  targetLanguageLevel?: unknown
}

export async function POST(request: Request) {
  let body: ComprehensionRoundRequest = {}

  try {
    body = (await request.json()) as ComprehensionRoundRequest
  } catch {
    body = {}
  }

  const targetLanguage = resolveSupportedLanguage(body.targetLanguage)
  const targetLanguageLevel = resolveTargetLanguageLevel(body.targetLanguageLevel)
  const round = generateComprehensionRound({ targetLanguage, targetLanguageLevel })

  return NextResponse.json({ round })
}
