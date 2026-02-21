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
import {
  NUMBER_DIFFICULTY_CONFIGS,
  formatSpokenText,
  generateNumberByDifficulty,
} from "@/lib/trainers/number"
import { cn } from "@/lib/utils"
import type { MigratedUserSettings } from "@/lib/web-migration"

type NumberChallengeStatus = "active" | "correct" | "incorrect"
type PlaybackStatus = "idle" | "loading" | "playing" | "finished"

interface NumberTrainerProps {
  settings: MigratedUserSettings
  onSettingsChange: (nextSettings: MigratedUserSettings) => void
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

export function NumberTrainer({
  settings,
  onSettingsChange,
}: NumberTrainerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentNumber, setCurrentNumber] = useState<number | null>(null)
  const [challengeStatus, setChallengeStatus] =
    useState<NumberChallengeStatus>("active")
  const [playbackStatus, setPlaybackStatus] = useState<PlaybackStatus>("idle")
  const [userInput, setUserInput] = useState("")
  const [spokenText, setSpokenText] = useState("")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const difficultyConfig = useMemo(
    () =>
      NUMBER_DIFFICULTY_CONFIGS.find(
        (config) => config.label === settings.numberTrainerDifficulty
      ),
    [settings.numberTrainerDifficulty]
  )

  const targetLanguageLabel =
    targetLanguageLabelMap[settings.targetLanguage] ?? settings.targetLanguage

  const requestRoundFromApi = useCallback(async () => {
    const response = await fetch("/api/trainers/number/round", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        difficulty: settings.numberTrainerDifficulty,
        targetLanguage: settings.targetLanguage,
        sentenceMode: settings.numberTrainerGenSentence,
      }),
    })

    if (!response.ok) {
      throw new Error(`Number round request failed: ${response.status}`)
    }

    const payload = (await response.json()) as { number?: unknown; text?: unknown }

    if (typeof payload.number !== "number" || typeof payload.text !== "string") {
      throw new Error("Invalid number round response")
    }

    return payload
  }, [
    settings.numberTrainerDifficulty,
    settings.numberTrainerGenSentence,
    settings.targetLanguage,
  ])

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

  const startRound = useCallback(async () => {
    setErrorMessage(null)
    setPlaybackStatus("loading")

    let nextNumber: number
    let nextText: string

    try {
      const payload = await requestRoundFromApi()
      nextNumber = payload.number
      nextText = payload.text
    } catch {
      nextNumber = generateNumberByDifficulty(settings.numberTrainerDifficulty)
      nextText = formatSpokenText(
        nextNumber,
        settings.targetLanguage,
        settings.numberTrainerGenSentence
      )
    }

    setCurrentNumber(nextNumber)
    setChallengeStatus("active")
    setUserInput("")
    await speakCurrentNumber(nextText)
  }, [
    requestRoundFromApi,
    settings.numberTrainerDifficulty,
    settings.numberTrainerGenSentence,
    settings.targetLanguage,
    speakCurrentNumber,
  ])

  const handleStart = useCallback(async () => {
    setIsPlaying(true)
    await startRound()
  }, [startRound])

  const handleStop = () => {
    setIsPlaying(false)
    setPlaybackStatus("idle")
    setChallengeStatus("active")
    setCurrentNumber(null)
    setUserInput("")
    setSpokenText("")
    setErrorMessage(null)
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }

  const handleSubmit = () => {
    if (currentNumber === null) {
      return
    }

    const parsedAnswer = Number.parseInt(userInput.replace(/[^\d]/g, ""), 10)
    const isCorrect = Number.isFinite(parsedAnswer) && parsedAnswer === currentNumber
    setChallengeStatus(isCorrect ? "correct" : "incorrect")

    if (!isCorrect) {
      void speakCurrentNumber(spokenText)
    }
  }

  const handleReplayAudio = async () => {
    if (currentNumber === null || spokenText.length === 0) {
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
        <CardTitle>Number Trainer</CardTitle>
        <CardDescription>
          Migrated gameplay slice in <code>next/*</code>. Audio uses browser
          speech synthesis until server-side TTS APIs are integrated.
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
                      handleSubmit()
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button onClick={handleSubmit} disabled={userInput.length === 0}>
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
    return <Volume2Icon className="size-5 text-primary" />
  }
  if (status === "finished") {
    return <CheckIcon className="size-5 text-emerald-600" />
  }
  return <Volume2Icon className="size-5 text-muted-foreground" />
}
