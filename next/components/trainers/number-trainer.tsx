"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NUMBER_DIFFICULTY_CONFIGS } from "@/lib/trainers/number"
import { cn } from "@/lib/utils"
import type { MigratedUserSettings } from "@/lib/web-migration"

type NumberChallengeStatus = "active" | "correct" | "incorrect"
type PlaybackStatus = "idle" | "loading" | "playing" | "finished"

interface NumberTrainerProps {
  settings: MigratedUserSettings
  onSettingsChange: (nextSettings: MigratedUserSettings) => void
}

interface NumberSessionStats {
  attempts: number
  correct: number
  accuracy: number
}

interface NumberRoundPayload {
  round?: {
    id?: unknown
    text?: unknown
  }
}

interface NumberSessionStartPayload {
  sessionId?: unknown
}

interface NumberSessionEndPayload {
  summary?: {
    attempts?: unknown
    correct?: unknown
    accuracy?: unknown
  }
}

interface NumberEvaluationPayload {
  isCorrect?: unknown
  expectedNumber?: unknown
  attempts?: unknown
  correct?: unknown
  accuracy?: unknown
}

const targetLanguageLocaleMap: Record<string, string> = {
  en: "en-US",
  ja: "ja-JP",
  es: "es-ES",
  fr: "fr-FR",
}

const targetLanguageLabelMap: Record<string, string> = {
  en: "English",
  ja: "Japanese",
  es: "Spanish",
  fr: "French",
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

function resolveApiErrorMessage(
  payload: unknown,
  fallbackMessage: string
): string {
  if (
    payload &&
    typeof payload === "object" &&
    "error" in payload &&
    typeof payload.error === "string" &&
    payload.error.length > 0
  ) {
    return payload.error
  }
  return fallbackMessage
}

export function NumberTrainer({
  settings,
  onSettingsChange,
}: NumberTrainerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentRoundId, setCurrentRoundId] = useState<string | null>(null)
  const [currentNumber, setCurrentNumber] = useState<number | null>(null)
  const [challengeStatus, setChallengeStatus] =
    useState<NumberChallengeStatus>("active")
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>("idle")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [userInput, setUserInput] = useState("")
  const [spokenText, setSpokenText] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [sessionStats, setSessionStats] = useState<NumberSessionStats>({
    attempts: 0,
    correct: 0,
    accuracy: 0,
  })
  const [lastSessionStats, setLastSessionStats] =
    useState<NumberSessionStats | null>(null)

  const difficultyConfig = useMemo(
    () =>
      NUMBER_DIFFICULTY_CONFIGS.find(
        (config) => config.label === settings.numberTrainerDifficulty
      ),
    [settings.numberTrainerDifficulty]
  )

  const targetLanguageLabel =
    targetLanguageLabelMap[settings.targetLanguage] ?? settings.targetLanguage

  const requestStartSessionFromApi = useCallback(async () => {
    const response = await fetch("/api/trainers/number/session/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (!response.ok) {
      let payload: unknown = null
      try {
        payload = await response.json()
      } catch {
        payload = null
      }
      throw new Error(
        resolveApiErrorMessage(payload, `Start session failed: ${response.status}`)
      )
    }

    const payload = (await response.json()) as NumberSessionStartPayload

    if (typeof payload.sessionId !== "string" || payload.sessionId.length === 0) {
      throw new Error("Invalid session start response.")
    }

    return payload.sessionId
  }, [])

  const requestRoundFromApi = useCallback(
    async (nextSessionId: string) => {
      const response = await fetch("/api/trainers/number/round", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: nextSessionId,
          difficulty: settings.numberTrainerDifficulty,
          targetLanguage: settings.targetLanguage,
          sentenceMode: settings.numberTrainerGenSentence,
        }),
      })

      if (!response.ok) {
        let payload: unknown = null
        try {
          payload = await response.json()
        } catch {
          payload = null
        }
        throw new Error(
          resolveApiErrorMessage(payload, `Number round failed: ${response.status}`)
        )
      }

      const payload = (await response.json()) as NumberRoundPayload
      const round = payload.round
      if (
        !round ||
        typeof round.id !== "string" ||
        typeof round.text !== "string" ||
        round.id.length === 0 ||
        round.text.length === 0
      ) {
        throw new Error("Invalid number round response.")
      }

      return {
        id: round.id,
        text: round.text,
      }
    },
    [
      settings.numberTrainerDifficulty,
      settings.numberTrainerGenSentence,
      settings.targetLanguage,
    ]
  )

  const requestEvaluateFromApi = useCallback(
    async (nextSessionId: string, nextRoundId: string, nextUserInput: string) => {
      const response = await fetch("/api/trainers/number/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: nextSessionId,
          roundId: nextRoundId,
          userInput: nextUserInput,
        }),
      })

      if (!response.ok) {
        let payload: unknown = null
        try {
          payload = await response.json()
        } catch {
          payload = null
        }
        throw new Error(
          resolveApiErrorMessage(payload, `Evaluate failed: ${response.status}`)
        )
      }

      const payload = (await response.json()) as NumberEvaluationPayload
      if (
        typeof payload.isCorrect !== "boolean" ||
        typeof payload.expectedNumber !== "number" ||
        typeof payload.attempts !== "number" ||
        typeof payload.correct !== "number" ||
        typeof payload.accuracy !== "number"
      ) {
        throw new Error("Invalid number evaluation response.")
      }

      return {
        isCorrect: payload.isCorrect,
        expectedNumber: payload.expectedNumber,
        stats: {
          attempts: payload.attempts,
          correct: payload.correct,
          accuracy: payload.accuracy,
        } satisfies NumberSessionStats,
      }
    },
    []
  )

  const requestEndSessionFromApi = useCallback(async (nextSessionId: string) => {
    const response = await fetch("/api/trainers/number/session/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: nextSessionId }),
    })

    if (!response.ok) {
      let payload: unknown = null
      try {
        payload = await response.json()
      } catch {
        payload = null
      }
      throw new Error(
        resolveApiErrorMessage(payload, `End session failed: ${response.status}`)
      )
    }

    const payload = (await response.json()) as NumberSessionEndPayload
    const summary = payload.summary
    if (
      !summary ||
      typeof summary.attempts !== "number" ||
      typeof summary.correct !== "number" ||
      typeof summary.accuracy !== "number"
    ) {
      throw new Error("Invalid number session summary response.")
    }

    return {
      attempts: summary.attempts,
      correct: summary.correct,
      accuracy: summary.accuracy,
    } satisfies NumberSessionStats
  }, [])

  const speakCurrentNumber = useCallback(
    async (text: string) => {
      setSpokenText(text)
      setPlaybackStatus("loading")
      try {
        setPlaybackStatus("playing")
        await speakText({
          text,
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

  const startRound = useCallback(async (nextSessionId: string) => {
    setErrorMessage(null)
    setPlaybackStatus("loading")
    const payload = await requestRoundFromApi(nextSessionId)

    setCurrentRoundId(payload.id)
    setCurrentNumber(null)
    setChallengeStatus("active")
    setUserInput("")
    await speakCurrentNumber(payload.text)
  }, [requestRoundFromApi, speakCurrentNumber])

  const handleStart = useCallback(async () => {
    setErrorMessage(null)
    setSessionStats({ attempts: 0, correct: 0, accuracy: 0 })
    setIsPlaying(false)
    setSessionId(null)
    setCurrentRoundId(null)
    setCurrentNumber(null)
    setUserInput("")
    setChallengeStatus("active")
    setPlaybackStatus("idle")
    setSpokenText("")
    let createdSessionId: string | null = null

    try {
      const nextSessionId = await requestStartSessionFromApi()
      createdSessionId = nextSessionId
      setSessionId(nextSessionId)
      setIsPlaying(true)
      await startRound(nextSessionId)
    } catch (error) {
      if (createdSessionId) {
        try {
          await requestEndSessionFromApi(createdSessionId)
        } catch {
          // Ignore cleanup failures while reporting the root startup error.
        }
      }
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to start number trainer."
      )
      setIsPlaying(false)
      setSessionId(null)
      setCurrentRoundId(null)
    }
  }, [requestEndSessionFromApi, requestStartSessionFromApi, startRound])

  const handleStop = useCallback(async () => {
    const nextSessionId = sessionId

    setIsPlaying(false)
    setSessionId(null)
    setCurrentRoundId(null)
    setPlaybackStatus("idle")
    setChallengeStatus("active")
    setCurrentNumber(null)
    setUserInput("")
    setSpokenText("")
    setIsSubmitting(false)

    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    if (!nextSessionId) {
      return
    }

    try {
      const summary = await requestEndSessionFromApi(nextSessionId)
      setLastSessionStats(summary)
      setSessionStats(summary)
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to end training session."
      )
    }
  }, [requestEndSessionFromApi, sessionId])

  const handleSubmit = useCallback(async () => {
    if (!sessionId || !currentRoundId || userInput.length === 0 || isSubmitting) {
      return
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      const result = await requestEvaluateFromApi(sessionId, currentRoundId, userInput)
      setCurrentNumber(result.expectedNumber)
      setSessionStats(result.stats)
      setChallengeStatus(result.isCorrect ? "correct" : "incorrect")
      if (!result.isCorrect) {
        await speakCurrentNumber(spokenText)
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to evaluate answer."
      )
    } finally {
      setIsSubmitting(false)
    }
  }, [
    currentRoundId,
    isSubmitting,
    requestEvaluateFromApi,
    sessionId,
    speakCurrentNumber,
    spokenText,
    userInput,
  ])

  const handleReplayAudio = async () => {
    if (spokenText.length === 0) {
      return
    }
    await speakCurrentNumber(spokenText)
  }

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (!sessionId) {
        return
      }

      void fetch("/api/trainers/number/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
        keepalive: true,
      })
    }
  }, [sessionId])

  useEffect(() => {
    if (challengeStatus === "active" || !sessionId) {
      return
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault()
        void startRound(sessionId)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [challengeStatus, sessionId, startRound])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Number Trainer</CardTitle>
        <CardDescription>
          Server-backed number rounds with persistent attempts in{" "}
          <code>next/*</code>. Audio uses browser speech synthesis until
          server-side TTS APIs are integrated.
        </CardDescription>
      </CardHeader>

      {!isPlaying ? (
        <>
          <CardContent className="space-y-4 text-sm">
            <p>
              Test your ability to hear numbers in <strong>{targetLanguageLabel}</strong>
              .
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <fieldset className="space-y-2 rounded-lg border p-3">
                <legend className="px-1 text-xs font-medium text-muted-foreground uppercase">
                  Difficulty
                </legend>
                {NUMBER_DIFFICULTY_CONFIGS.map((config) => (
                  <label
                    key={config.label}
                    className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1 hover:bg-muted/50"
                  >
                    <input
                      type="radio"
                      name="number-difficulty"
                      value={config.label}
                      checked={settings.numberTrainerDifficulty === config.label}
                      onChange={() =>
                        onSettingsChange({
                          ...settings,
                          numberTrainerDifficulty: config.label,
                        })
                      }
                    />
                    <span>
                      <span className="block font-medium capitalize">
                        {config.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {config.helpText}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>

              <fieldset className="space-y-3 rounded-lg border p-3">
                <legend className="px-1 text-xs font-medium text-muted-foreground uppercase">
                  Options
                </legend>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.numberTrainerGenSentence}
                    onChange={(event) =>
                      onSettingsChange({
                        ...settings,
                        numberTrainerGenSentence: event.target.checked,
                      })
                    }
                  />
                  Sentence mode
                </label>
                <p className="text-xs text-muted-foreground">
                  Sentence mode currently uses local templates. AI sentence
                  generation will move to first-party APIs in a later phase.
                </p>
                <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
                  Current difficulty:{" "}
                  <strong className="capitalize">
                    {difficultyConfig?.label ?? settings.numberTrainerDifficulty}
                  </strong>
                </div>
                {lastSessionStats ? (
                  <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
                    Last session: {lastSessionStats.correct}/
                    {lastSessionStats.attempts} correct ({lastSessionStats.accuracy}
                    %)
                  </div>
                ) : null}
              </fieldset>
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => void handleStart()}>
              Start
            </Button>
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
                {settings.numberTrainerDifficulty}
              </Badge>
              <Badge variant="outline">Attempts: {sessionStats.attempts}</Badge>
              <Badge variant="outline">Accuracy: {sessionStats.accuracy}%</Badge>
            </div>

            {challengeStatus === "active" ? (
              <div className="space-y-2">
                <Label htmlFor="number-answer">Type the number you heard</Label>
                <Input
                  id="number-answer"
                  autoFocus
                  value={userInput}
                  inputMode="numeric"
                  placeholder="Enter number"
                  onChange={(event) => {
                    const sanitizedValue = event.target.value.replace(/[^\d]/g, "")
                    setUserInput(sanitizedValue)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      void handleSubmit()
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => void handleSubmit()}
                    disabled={userInput.length === 0 || isSubmitting}
                  >
                    {isSubmitting ? "Checking..." : "Submit"}
                  </Button>
                  <Button variant="outline" onClick={() => void handleReplayAudio()}>
                    Replay Audio
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-lg border p-3">
                <p
                  className={cn(
                    "font-medium",
                    challengeStatus === "correct"
                      ? "text-emerald-600"
                      : "text-red-600"
                  )}
                >
                  {challengeStatus === "correct" ? "Correct!" : "Incorrect"}
                </p>
                <p className="text-sm">
                  The number was{" "}
                  <strong>
                    {currentNumber?.toLocaleString(settings.appLanguage)}
                  </strong>
                  .
                </p>
                {settings.numberTrainerGenSentence ? (
                  <p className="text-xs text-muted-foreground">{spokenText}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      if (!sessionId) {
                        return
                      }
                      void startRound(sessionId)
                    }}
                  >
                    Next Round
                  </Button>
                  <Button variant="outline" onClick={() => void handleReplayAudio()}>
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
          <CardFooter className="justify-between">
            <p className="text-xs text-muted-foreground">
              Target language: {targetLanguageLabel}
            </p>
            <Button variant="outline" onClick={() => void handleStop()}>
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
