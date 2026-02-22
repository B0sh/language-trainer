import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface EndNumberSessionRequest {
  sessionId?: unknown
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

  let body: EndNumberSessionRequest = {}
  try {
    body = (await request.json()) as EndNumberSessionRequest
  } catch {
    body = {}
  }

  const sessionId = typeof body.sessionId === "string" ? body.sessionId : ""
  if (!sessionId) {
    return NextResponse.json(
      { error: "sessionId is required." },
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

  const [attempts, correct] = await prisma.$transaction([
    prisma.trainingAttempt.count({ where: { sessionId } }),
    prisma.trainingAttempt.count({ where: { sessionId, isCorrect: true } }),
  ])

  const summary = {
    attempts,
    correct,
    accuracy: buildAccuracy(correct, attempts),
  }

  const endedAt = trainingSession.endedAt ?? new Date()
  if (!trainingSession.endedAt) {
    await prisma.trainingSession.update({
      where: { id: sessionId },
      data: {
        endedAt,
        summary,
      },
    })
  }

  return NextResponse.json({
    sessionId,
    endedAt: endedAt.toISOString(),
    summary,
  })
}
