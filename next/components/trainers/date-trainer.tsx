"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { CalendarDaysIcon, CheckIcon, Loader2Icon, Volume2Icon } from "lucide-react"

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
import {
  DATE_DIFFICULTY_CONFIGS,
  checkDateAnswer,
  formatDateForInput,
  formatDateForLocale,
  formatDateSpeechText,
  generateDateRound,
  getDateInputPlaceholder,
} from "@/lib/trainers/date"
import { cn } from "@/lib/utils"
import type { MigratedUserSettings } from "@/lib/web-migration"

type DateChallengeStatus = "active" | "correct" | "incorrect"
type PlaybackStatus = "idle" | "loading" | "playing" | "finished"

interface DateTrainerProps {
  settings: MigratedUserSettings
  onSettingsChange: (nextSettings: MigratedUserSettings) => void
}

interface DateRoundPayload {
  dateISO: string
  format: "yyyy-mm-dd" | "yyyy-mm" | "yyyy" | "mm" | "mm-dd" | "yyyy-mm-dd hh:mm" | "hh:mm"
  expectedInput: string
  answerDisplay: string
  speechText: string
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

export function DateTrainer({
  settings,
  onSettingsChange,
}: DateTrainerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [round, setRound] = useState<DateRoundPayload | null>(null)
  const [challengeStatus, setChallengeStatus] =
    useState<DateChallengeStatus>("active")
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>("idle")
  const [userInput, setUserInput] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const difficultyConfig = useMemo(
    () =>
      DATE_DIFFICULTY_CONFIGS.find(
        (config) => config.label === settings.dateTrainerDifficulty
      ),
    [settings.dateTrainerDifficulty]
  )

  const targetLanguageLabel =
    targetLanguageLabelMap[settings.targetLanguage] ?? settings.targetLanguage

  const requestRoundFromApi = useCallback(async () => {
    const response = await fetch("/api/trainers/date/round", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        difficulty: settings.dateTrainerDifficulty,
        targetLanguage: settings.targetLanguage,
        appLanguage: settings.appLanguage,
        sentenceMode: settings.dateTrainerGenSentence,
      }),
    })

    if (!response.ok) {
      throw new Error(`Date round request failed: ${response.status}`)
    }

    const payload = (await response.json()) as { round?: DateRoundPayload }
    if (!payload.round || typeof payload.round.dateISO !== "string") {
      throw new Error("Invalid date round response")
    }
    return payload.round
  }, [
    settings.appLanguage,
    settings.dateTrainerDifficulty,
    settings.dateTrainerGenSentence,
    settings.targetLanguage,
  ])

  const speakRound = useCallback(
    async (nextRound: DateRoundPayload) => {
      setPlaybackStatus("loading")
      try {
        setPlaybackStatus("playing")
        await speakText({
          text: nextRound.speechText,
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

    let nextRound: DateRoundPayload

    try {
      nextRound = await requestRoundFromApi()
    } catch {
      const generatedRound = generateDateRound(settings.dateTrainerDifficulty)
      nextRound = {
        dateISO: generatedRound.dateISO,
        format: generatedRound.format,
        expectedInput: formatDateForInput(generatedRound.dateISO, generatedRound.format),
        answerDisplay: formatDateForLocale(
          generatedRound.dateISO,
          generatedRound.format,
          settings.appLanguage
        ),
        speechText: formatDateSpeechText({
          dateISO: generatedRound.dateISO,
          format: generatedRound.format,
          targetLanguage: settings.targetLanguage,
          locale: settings.appLanguage,
          sentenceMode: settings.dateTrainerGenSentence,
        }),
      }
    }

    setRound(nextRound)
    setChallengeStatus("active")
    setUserInput("")
    await speakRound(nextRound)
  }, [
    requestRoundFromApi,
    settings.appLanguage,
    settings.dateTrainerDifficulty,
    settings.dateTrainerGenSentence,
    settings.targetLanguage,
    speakRound,
  ])

  const handleStart = useCallback(async () => {
    setIsPlaying(true)
    await startRound()
  }, [startRound])

  const handleStop = () => {
    setIsPlaying(false)
    setRound(null)
    setPlaybackStatus("idle")
    setChallengeStatus("active")
    setUserInput("")
    setErrorMessage(null)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }

  const handleSubmit = () => {
    if (!round) {
      return
    }

    const isCorrect = checkDateAnswer({
      dateISO: round.dateISO,
      format: round.format,
      userInput,
    })
    setChallengeStatus(isCorrect ? "correct" : "incorrect")

    if (!isCorrect) {
      void speakRound(round)
    }
  }

  const handleReplayAudio = async () => {
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
    if (challengeStatus === "active") {
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
  }, [challengeStatus, startRound])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Date Trainer</CardTitle>
        <CardDescription>
          Migrated date practice flow in <code>next/*</code> using first-party
          route handlers for round generation.
        </CardDescription>
      </CardHeader>

      {!isPlaying ? (
        <>
          <CardContent className="space-y-4 text-sm">
            <p>
              Practice hearing dates and times in <strong>{targetLanguageLabel}</strong>
              .
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <fieldset className="space-y-2 rounded-lg border p-3">
                <legend className="px-1 text-xs font-medium text-muted-foreground uppercase">
                  Difficulty
                </legend>
                {DATE_DIFFICULTY_CONFIGS.map((config) => (
                  <label
                    key={config.label}
                    className="flex cursor-pointer items-start gap-2 rounded-md px-2 py-1 hover:bg-muted/50"
                  >
                    <input
                      type="radio"
                      name="date-difficulty"
                      value={config.label}
                      checked={settings.dateTrainerDifficulty === config.label}
                      onChange={() =>
                        onSettingsChange({
                          ...settings,
                          dateTrainerDifficulty: config.label,
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
                    checked={settings.dateTrainerGenSentence}
                    onChange={(event) =>
                      onSettingsChange({
                        ...settings,
                        dateTrainerGenSentence: event.target.checked,
                      })
                    }
                  />
                  Sentence mode
                </label>
                <p className="text-xs text-muted-foreground">
                  Sentence mode uses local templates for now. AI sentence
                  generation will move to first-party APIs in a later phase.
                </p>
                <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
                  Current difficulty:{" "}
                  <strong className="capitalize">
                    {difficultyConfig?.label ?? settings.dateTrainerDifficulty}
                  </strong>
                </div>
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
                {settings.dateTrainerDifficulty}
              </Badge>
              {round ? (
                <Badge variant="outline" className="font-mono">
                  {round.format}
                </Badge>
              ) : null}
            </div>

            {challengeStatus === "active" ? (
              <div className="space-y-2">
                <Label htmlFor="date-answer">
                  Type the date/time you heard
                </Label>
                <Input
                  id="date-answer"
                  autoFocus
                  value={userInput}
                  placeholder={round ? getDateInputPlaceholder(round.format) : "YYYY-MM-DD"}
                  onChange={(event) => setUserInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSubmit()
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Expected format:{" "}
                  <code>
                    {round ? getDateInputPlaceholder(round.format) : "YYYY-MM-DD"}
                  </code>
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={userInput.trim().length === 0}>
                    Submit
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
                  The date was <strong>{round?.answerDisplay}</strong>.
                </p>
                {settings.dateTrainerGenSentence && round ? (
                  <p className="text-xs text-muted-foreground">
                    {round.speechText}
                  </p>
                ) : null}
                <p className="text-xs text-muted-foreground">
                  Canonical answer: <code>{round?.expectedInput}</code>
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => void startRound()}>Next Round</Button>
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
    return <CalendarDaysIcon className="size-5 text-primary" />
  }
  if (status === "finished") {
    return <CheckIcon className="size-5 text-emerald-600" />
  }
  return <Volume2Icon className="size-5 text-muted-foreground" />
}
