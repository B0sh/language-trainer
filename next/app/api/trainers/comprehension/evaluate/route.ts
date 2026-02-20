import { NextResponse } from "next/server"

import { evaluateComprehension } from "@/lib/trainers/comprehension"

interface ComprehensionEvaluateRequest {
  keyPoints?: unknown
  userInput?: unknown
}

export async function POST(request: Request) {
  let body: ComprehensionEvaluateRequest = {}

  try {
    body = (await request.json()) as ComprehensionEvaluateRequest
  } catch {
    body = {}
  }

  const keyPoints = Array.isArray(body.keyPoints)
    ? body.keyPoints.filter((item): item is string => typeof item === "string")
    : []
  const userInput = typeof body.userInput === "string" ? body.userInput : ""

  const evaluation = evaluateComprehension({ keyPoints, userInput })
  return NextResponse.json(evaluation)
}
