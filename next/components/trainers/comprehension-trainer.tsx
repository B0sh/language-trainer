"use client"

import { useCallback, useEffect, useState } from "react"
import { CheckIcon, Loader2Icon, Volume2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  evaluateComprehension,
  generateComprehensionRound,
  type ComprehensionEvaluation,
  type ComprehensionRound,
} from "@/lib/trainers/comprehension"
import { cn } from "@/lib/utils"
import type { MigratedUserSettings } from "@/lib/web-migration"

type PlaybackStatus = "idle" | "loading" | "playing" | "finished"
type CompStatus = "active" | "evaluating" | "correct" | "incorrect"

interface Props {
  settings: MigratedUserSettings
}

const targetLanguageLocaleMap: Record<string, string> = {
  en: "en-US",
  ja: "ja-JP",
  es: "es-ES",
  fr: "fr-FR",
}

function speakText({
  text,
  language,
  volume,
}: {
  text: string
  language: string
  volume: number
}): Promise<void> {
  if (
    typeof window === "undefined" ||
    typeof window.speechSynthesis === "undefined"
  ) {
    return Promise.resolve()
  }

  window.speechSynthesis.cancel()

  return new Promise((resolve, reject) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = targetLanguageLocaleMap[language] ?? "en-US"
    utterance.volume = Math.max(0, Math.min(1, volume / 100))
    utterance.rate = 1
    utterance.pitch = 1
    utterance.onend = () => resolve()
    utterance.onerror = (event) =>
      reject(new Error(event.error || "Unknown speech synthesis error"))
    window.speechSynthesis.speak(utterance)
  })
}

export function ComprehensionTrainer({ settings }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [round, setRound] = useState<ComprehensionRound | null>(null)
  const [userInput, setUserInput] = useState("")
  const [status, setStatus] = useState<CompStatus>("active")
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>("idle")
  const [evaluation, setEvaluation] = useState<ComprehensionEvaluation | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const fetchRoundFromApi = useCallback(async () => {
    const response = await fetch("/api/trainers/comprehension/round", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        targetLanguage: settings.targetLanguage,
        targetLanguageLevel: settings.targetLanguageLevel,
      }),
    })

    if (!response.ok) {
      throw new Error(`Comprehension round request failed: ${response.status}`)
    }

    const payload = (await response.json()) as { round?: ComprehensionRound }
    if (!payload.round || typeof payload.round.text !== "string") {
      throw new Error("Invalid comprehension round response")
    }

    return payload.round
  }, [settings.targetLanguage, settings.targetLanguageLevel])

  const evaluateWithApi = useCallback(async () => {
    if (!round) {
      throw new Error("No active comprehension round")
    }

    const response = await fetch("/api/trainers/comprehension/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyPoints: round.keyPoints,
        userInput,
      }),
    })

    if (!response.ok) {
      throw new Error(`Comprehension evaluate request failed: ${response.status}`)
    }

    const payload = (await response.json()) as ComprehensionEvaluation
    if (typeof payload.valid !== "boolean" || typeof payload.explanation !== "string") {
      throw new Error("Invalid comprehension evaluation response")
    }

    return payload
  }, [round, userInput])

  const speakRound = useCallback(
    async (nextRound: ComprehensionRound) => {
      setPlaybackStatus("loading")
      try {
        setPlaybackStatus("playing")
        await speakText({
          text: nextRound.text,
          language: settings.targetLanguage,
          volume: settings.volume,
        })
        setPlaybackStatus("finished")
      } catch (error) {
        setPlaybackStatus("idle")
        setErrorMessage(
          error instanceof Error
            ? `Audio playback failed: ${error.message}`
            : "Audio playback failed."
        )
      }
    },
    [settings.targetLanguage, settings.volume]
  )

  const startRound = useCallback(async () => {
    setErrorMessage(null)
    setStatus("active")
    setEvaluation(null)
    setUserInput("")

    let nextRound: ComprehensionRound
    try {
      nextRound = await fetchRoundFromApi()
    } catch {
      nextRound = generateComprehensionRound({
        targetLanguage:
          settings.targetLanguage === "ja" ||
          settings.targetLanguage === "es" ||
          settings.targetLanguage === "fr"
            ? settings.targetLanguage
            : "en",
        targetLanguageLevel: settings.targetLanguageLevel,
      })
    }

    setRound(nextRound)
    await speakRound(nextRound)
  }, [
    fetchRoundFromApi,
    settings.targetLanguage,
    settings.targetLanguageLevel,
    speakRound,
  ])

  const handleStart = async () => {
    setIsPlaying(true)
    await startRound()
  }

  const handleSubmit = async () => {
    if (!round) {
      return
    }

    setStatus("evaluating")
    setErrorMessage(null)

    let result: ComprehensionEvaluation
    try {
      result = await evaluateWithApi()
    } catch {
      result = evaluateComprehension({
        keyPoints: round.keyPoints,
        userInput,
      })
    }

    setEvaluation(result)
    setStatus(result.valid ? "correct" : "incorrect")
  }

  const handleStop = () => {
    setIsPlaying(false)
    setRound(null)
    setUserInput("")
    setStatus("active")
    setPlaybackStatus("idle")
    setEvaluation(null)
    setErrorMessage(null)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }

  const replayAudio = async () => {
    if (!round) {
      return
    }
    await speakRound(round)
  }

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (status !== "correct" && status !== "incorrect") {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        void startRound()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [status, startRound])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comprehension Trainer</CardTitle>
        <CardDescription>
          Migrated comprehension trainer in <code>next/*</code> with first-party
          round generation and evaluation routes.
        </CardDescription>
      </CardHeader>

      {!isPlaying ? (
        <>
          <CardContent className="space-y-3 text-sm">
            <p>
              Practice listening comprehension in your target language. After the
              audio plays, summarize what was said.
            </p>
            <div className="rounded-md border bg-muted/40 p-3 text-xs">
              Evaluation currently uses heuristic key-point matching while
              server-side LLM evaluation is being migrated.
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => void handleStart()}>Start</Button>
          </CardFooter>
        </>
      ) : (
        <>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <PlaybackIndicator status={playbackStatus} />
              <Badge variant="outline" className="capitalize">
                {playbackStatus}
              </Badge>
              <Badge variant="secondary" className="capitalize">
                {settings.targetLanguageLevel}
              </Badge>
            </div>

            {status === "active" || status === "evaluating" ? (
              <div className="space-y-2">
                <Label htmlFor="comp-summary">
                  Write a summary of what was said
                </Label>
                <Textarea
                  id="comp-summary"
                  autoFocus
                  rows={4}
                  value={userInput}
                  placeholder="Type your summary..."
                  disabled={status === "evaluating"}
                  onChange={(event) => setUserInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault()
                      if (userInput.trim().length > 0 && status !== "evaluating") {
                        void handleSubmit()
                      }
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => void handleSubmit()}
                    disabled={userInput.trim().length === 0 || status === "evaluating"}
                  >
                    {status === "evaluating" ? (
                      <>
                        <Loader2Icon className="animate-spin" />
                        Evaluating
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => void replayAudio()}>
                    Replay Audio
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-lg border p-3">
                <p
                  className={cn(
                    "font-medium",
                    status === "correct" ? "text-emerald-600" : "text-red-600"
                  )}
                >
                  {status === "correct" ? "Correct" : "Needs Improvement"}
                </p>
                <p className="text-sm">{evaluation?.explanation}</p>
                {evaluation ? (
                  <p className="text-xs text-muted-foreground">
                    Score: {(evaluation.score * 100).toFixed(0)}% | Matched:{" "}
                    {evaluation.matchedPoints.length}/{round?.keyPoints.length ?? 0}
                  </p>
                ) : null}
                {round ? (
                  <details className="rounded-md bg-muted/40 p-2 text-xs">
                    <summary className="cursor-pointer font-medium">
                      Show reference transcript
                    </summary>
                    <p className="mt-2 whitespace-pre-wrap">{round.text}</p>
                  </details>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => void startRound()}>Next Round</Button>
                  <Button variant="outline" onClick={() => void replayAudio()}>
                    Replay Audio
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Press Enter or Space for next round.
                </p>
              </div>
            )}

            {errorMessage ? (
              <p className="text-sm text-red-600">{errorMessage}</p>
            ) : null}
          </CardContent>
          <CardFooter className="justify-end">
            <Button variant="outline" onClick={handleStop}>
              Stop
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}

function PlaybackIndicator({ status }: { status: PlaybackStatus }) {
  if (status === "loading") {
    return <Loader2Icon className="size-5 animate-spin text-muted-foreground" />
  }
  if (status === "playing") {
    return <Volume2Icon className="size-5 text-primary" />
  }
  if (status === "finished") {
    return <CheckIcon className="size-5 text-emerald-600" />
  }
  return <Volume2Icon className="size-5 text-muted-foreground" />
}
