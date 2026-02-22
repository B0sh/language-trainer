import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import {
  formatSpokenText,
  generateNumberByDifficulty,
  resolveDifficulty,
} from "@/lib/trainers/number"

interface NumberRoundRequest {
  sessionId?: unknown
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

  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : ""
  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId is required." },
      { status: 400 }
    )
  }

  const activeTrainingSession = await prisma.trainingSession.findFirst({
    where: {
      id: sessionId,
      userId,
      trainerType: "number",
      endedAt: null,
    },
    select: { id: true },
  })

  if (!activeTrainingSession) {
    return NextResponse.json(
      { error: "Active number training session not found." },
      { status: 404 }
    )
  }

  const difficulty = resolveDifficulty(body.difficulty)
  const targetLanguage =
    typeof body.targetLanguage === "string" ? body.targetLanguage : "en"
  const sentenceMode = Boolean(body.sentenceMode)

  const number = generateNumberByDifficulty(difficulty)
  const text = formatSpokenText(number, targetLanguage, sentenceMode)
  const round = await prisma.numberTrainingRound.create({
    data: {
      sessionId,
      userId,
      number,
      text,
      difficulty,
      targetLanguage,
      sentenceMode,
    },
    select: { id: true },
  })

  return NextResponse.json({
    round: {
      id: round.id,
      text,
      difficulty,
      targetLanguage,
      sentenceMode,
    },
  })
}
