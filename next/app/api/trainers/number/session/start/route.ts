import { NextResponse } from "next/server"

import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers })
  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const trainingSession = await prisma.trainingSession.create({
    data: {
      userId,
      trainerType: "number",
    },
    select: {
      id: true,
      startedAt: true,
    },
  })

  return NextResponse.json({
    sessionId: trainingSession.id,
    startedAt: trainingSession.startedAt.toISOString(),
  })
}
