import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface NumberEvaluateRequest {
  sessionId?: unknown
  roundId?: unknown
  userInput?: unknown
}

function parseUserNumberInput(rawInput: string): number | null {
  const digitsOnly = rawInput.replace(/[^\d]/g, "")
  if (!digitsOnly) {
    return null
  }

  const parsed = Number.parseInt(digitsOnly, 10)
  return Number.isFinite(parsed) ? parsed : null
}

function buildAccuracy(correct: number, attempts: number): number {
  if (attempts === 0) {
    return 0
  }
  return Math.round((correct / attempts) * 100)
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: NumberEvaluateRequest = {}
  try {
    body = (await request.json()) as NumberEvaluateRequest
  } catch {
    body = {}
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : ""
  const roundId = typeof body.roundId === "string" ? body.roundId : ""
  const userInput = typeof body.userInput === "string" ? body.userInput : ""

  if (!sessionId || !roundId) {
    return NextResponse.json(
      { error: "sessionId and roundId are required." },
      { status: 400 }
    )
  }

  const trainingSession = await prisma.trainingSession.findFirst({
    where: {
      id: sessionId,
      userId,
      trainerType: "number",
    },
    select: { id: true, endedAt: true },
  })

  if (!trainingSession) {
    return NextResponse.json({ error: "Session not found." }, { status: 404 })
  }

  if (trainingSession.endedAt) {
    return NextResponse.json({ error: "Session has ended." }, { status: 409 })
  }

  const round = await prisma.numberTrainingRound.findFirst({
    where: {
      id: roundId,
      sessionId,
      userId,
    },
    select: {
      id: true,
      number: true,
      text: true,
      difficulty: true,
      targetLanguage: true,
      sentenceMode: true,
      evaluatedAt: true,
    },
  })

  if (!round) {
    return NextResponse.json({ error: "Round not found." }, { status: 404 })
  }

  if (round.evaluatedAt) {
    const existingAttempt = await prisma.trainingAttempt.findFirst({
      where: { roundId: round.id },
      select: {
        isCorrect: true,
        evaluation: true,
      },
    })

    const [attempts, correct] = await prisma.$transaction([
      prisma.trainingAttempt.count({ where: { sessionId } }),
      prisma.trainingAttempt.count({ where: { sessionId, isCorrect: true } }),
    ])

    return NextResponse.json({
      isCorrect: existingAttempt?.isCorrect ?? false,
      expectedNumber:
        (existingAttempt?.evaluation as { expectedNumber?: number } | null)
          ?.expectedNumber ?? round.number,
      attempts,
      correct,
      accuracy: buildAccuracy(correct, attempts),
    })
  }

  const parsedAnswer = parseUserNumberInput(userInput)
  const isCorrect = parsedAnswer === round.number

  try {
    await prisma.$transaction([
      prisma.trainingAttempt.create({
        data: {
          sessionId,
          roundId: round.id,
          promptPayload: {
            roundId: round.id,
            text: round.text,
            difficulty: round.difficulty,
            targetLanguage: round.targetLanguage,
            sentenceMode: round.sentenceMode,
          },
          userInput,
          evaluation: {
            expectedNumber: round.number,
            parsedAnswer,
          },
          isCorrect,
        },
      }),
      prisma.numberTrainingRound.update({
        where: { id: round.id },
        data: { evaluatedAt: new Date() },
      }),
    ])
  } catch {
    const existingAttempt = await prisma.trainingAttempt.findFirst({
      where: { roundId: round.id },
      select: {
        isCorrect: true,
        evaluation: true,
      },
    })

    if (existingAttempt) {
      const [attempts, correct] = await prisma.$transaction([
        prisma.trainingAttempt.count({ where: { sessionId } }),
        prisma.trainingAttempt.count({ where: { sessionId, isCorrect: true } }),
      ])

      return NextResponse.json({
        isCorrect: existingAttempt.isCorrect,
        expectedNumber:
          (existingAttempt.evaluation as { expectedNumber?: number } | null)
            ?.expectedNumber ?? round.number,
        attempts,
        correct,
        accuracy: buildAccuracy(correct, attempts),
      })
    }

    return NextResponse.json(
      { error: "Unable to persist evaluation." },
      { status: 500 }
    )
  }

  const [attempts, correct] = await prisma.$transaction([
    prisma.trainingAttempt.count({ where: { sessionId } }),
    prisma.trainingAttempt.count({ where: { sessionId, isCorrect: true } }),
  ])

  return NextResponse.json({
    isCorrect,
    expectedNumber: round.number,
    parsedAnswer,
    attempts,
    correct,
    accuracy: buildAccuracy(correct, attempts),
  })
}
