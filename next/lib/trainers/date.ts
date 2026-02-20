export type DateDifficulty = "easy" | "medium" | "hard"
export type DateRoundFormat =
  | "yyyy-mm-dd"
  | "yyyy-mm"
  | "yyyy"
  | "mm"
  | "mm-dd"
  | "yyyy-mm-dd hh:mm"
  | "hh:mm"

export interface DateRoundGenerator {
  format: DateRoundFormat
  weight: number
  min: Date
  max: Date
}

export interface DateRoundConfig {
  label: DateDifficulty
  helpText: string
  generators: DateRoundGenerator[]
}

export const DATE_DIFFICULTY_CONFIGS: DateRoundConfig[] = [
  {
    label: "easy",
    helpText: "Practice one date or time input.",
    generators: [
      { format: "yyyy", weight: 1, min: new Date(1975, 0, 1), max: new Date() },
      { format: "mm", weight: 1, min: new Date(1975, 0, 1), max: new Date() },
      { format: "hh:mm", weight: 1, min: new Date(1975, 0, 1), max: new Date() },
    ],
  },
  {
    label: "medium",
    helpText: "Practice full dates from 1975.",
    generators: [
      {
        format: "yyyy-mm-dd",
        weight: 1,
        min: new Date(1975, 0, 1),
        max: new Date(),
      },
      {
        format: "yyyy-mm",
        weight: 2,
        min: new Date(1975, 0, 1),
        max: new Date(),
      },
      {
        format: "mm-dd",
        weight: 2,
        min: new Date(1975, 0, 1),
        max: new Date(),
      },
    ],
  },
  {
    label: "hard",
    helpText: "Practice with full dates and time.",
    generators: [
      {
        format: "yyyy-mm-dd hh:mm",
        weight: 1,
        min: new Date(1900, 0, 1),
        max: new Date(2100, 0, 1),
      },
    ],
  },
]

export function resolveDateDifficulty(value: unknown): DateDifficulty {
  if (value === "medium" || value === "hard" || value === "easy") {
    return value
  }
  return "easy"
}

function getRandomDate(start: Date, end: Date): Date {
  const startTime = start.getTime()
  const endTime = end.getTime()
  const randomTime = Math.random() * (endTime - startTime) + startTime
  return new Date(randomTime)
}

function getWeightedGenerator(
  generators: DateRoundGenerator[]
): DateRoundGenerator {
  const totalWeight = generators.reduce((sum, item) => sum + item.weight, 0)
  const randomWeight = Math.random() * totalWeight
  let currentWeight = 0

  for (const generator of generators) {
    currentWeight += generator.weight
    if (randomWeight <= currentWeight) {
      return generator
    }
  }

  return generators[generators.length - 1]
}

function pad2(value: number): string {
  return `${value}`.padStart(2, "0")
}

function toDate(value: string): Date {
  return new Date(value)
}

export function generateDateRound(difficulty: DateDifficulty): {
  dateISO: string
  format: DateRoundFormat
} {
  const config = DATE_DIFFICULTY_CONFIGS.find((item) => item.label === difficulty)
  const fallback = DATE_DIFFICULTY_CONFIGS[0]
  const generator = getWeightedGenerator((config ?? fallback).generators)
  const date = getRandomDate(generator.min, generator.max)

  return {
    dateISO: date.toISOString(),
    format: generator.format,
  }
}

export function formatDateForInput(dateISO: string, format: DateRoundFormat): string {
  const date = toDate(dateISO)
  const year = date.getFullYear()
  const month = pad2(date.getMonth() + 1)
  const day = pad2(date.getDate())
  const hour = pad2(date.getHours())
  const minute = pad2(date.getMinutes())

  switch (format) {
    case "yyyy":
      return `${year}`
    case "yyyy-mm":
      return `${year}-${month}`
    case "yyyy-mm-dd":
      return `${year}-${month}-${day}`
    case "mm":
      return `${month}`
    case "mm-dd":
      return `${month}-${day}`
    case "yyyy-mm-dd hh:mm":
      return `${year}-${month}-${day} ${hour}:${minute}`
    case "hh:mm":
      return `${hour}:${minute}`
  }
}

export function formatDateForLocale(
  dateISO: string,
  format: DateRoundFormat,
  locale: string
): string {
  const date = toDate(dateISO)

  switch (format) {
    case "yyyy":
      return date.toLocaleDateString(locale, { year: "numeric" })
    case "yyyy-mm":
      return date.toLocaleDateString(locale, { year: "numeric", month: "long" })
    case "yyyy-mm-dd":
      return date.toLocaleDateString(locale, {
        year: "numeric",
        month: "long",
        day: "2-digit",
      })
    case "mm":
      return date.toLocaleDateString(locale, { month: "long" })
    case "mm-dd":
      return date.toLocaleDateString(locale, { month: "long", day: "2-digit" })
    case "yyyy-mm-dd hh:mm":
      return date.toLocaleString(locale, {
        year: "numeric",
        month: "long",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    case "hh:mm":
      return date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
  }
}

export function formatDateSpeechText({
  dateISO,
  format,
  targetLanguage,
  locale,
  sentenceMode,
}: {
  dateISO: string
  format: DateRoundFormat
  targetLanguage: string
  locale: string
  sentenceMode: boolean
}): string {
  const display = formatDateForLocale(dateISO, format, locale)
  if (!sentenceMode) {
    return display
  }

  switch (targetLanguage) {
    case "ja":
      return `日付は${display}です。`
    case "es":
      return `La fecha es ${display}.`
    case "fr":
      return `La date est ${display}.`
    default:
      return `The date is ${display}.`
  }
}

export function checkDateAnswer({
  dateISO,
  format,
  userInput,
}: {
  dateISO: string
  format: DateRoundFormat
  userInput: string
}): boolean {
  const date = toDate(dateISO)
  const input = userInput.trim()

  let match: RegExpMatchArray | null
  let year: number
  let month: number
  let day: number
  let hour: number
  let minute: number

  switch (format) {
    case "yyyy":
      year = Number.parseInt(input, 10)
      return Number.isFinite(year) && date.getFullYear() === year
    case "yyyy-mm":
      match = input.match(/^(\d{4})[-/](\d{1,2})$/)
      if (!match) return false
      year = Number.parseInt(match[1], 10)
      month = Number.parseInt(match[2], 10)
      return date.getFullYear() === year && date.getMonth() + 1 === month
    case "yyyy-mm-dd":
      match = input.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/)
      if (!match) return false
      year = Number.parseInt(match[1], 10)
      month = Number.parseInt(match[2], 10)
      day = Number.parseInt(match[3], 10)
      return (
        date.getFullYear() === year &&
        date.getMonth() + 1 === month &&
        date.getDate() === day
      )
    case "mm":
      month = Number.parseInt(input, 10)
      return Number.isFinite(month) && date.getMonth() + 1 === month
    case "mm-dd":
      match = input.match(/^(\d{1,2})[-/](\d{1,2})$/)
      if (!match) return false
      month = Number.parseInt(match[1], 10)
      day = Number.parseInt(match[2], 10)
      return date.getMonth() + 1 === month && date.getDate() === day
    case "yyyy-mm-dd hh:mm":
      match = input.match(
        /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[ T](\d{1,2}):(\d{1,2})$/
      )
      if (!match) return false
      year = Number.parseInt(match[1], 10)
      month = Number.parseInt(match[2], 10)
      day = Number.parseInt(match[3], 10)
      hour = Number.parseInt(match[4], 10)
      minute = Number.parseInt(match[5], 10)
      return (
        date.getFullYear() === year &&
        date.getMonth() + 1 === month &&
        date.getDate() === day &&
        date.getHours() === hour &&
        date.getMinutes() === minute
      )
    case "hh:mm":
      match = input.match(/^(\d{1,2}):(\d{1,2})$/)
      if (!match) return false
      hour = Number.parseInt(match[1], 10)
      minute = Number.parseInt(match[2], 10)
      return date.getHours() === hour && date.getMinutes() === minute
  }
}

export function getDateInputPlaceholder(format: DateRoundFormat): string {
  switch (format) {
    case "yyyy":
      return "YYYY"
    case "yyyy-mm":
      return "YYYY-MM"
    case "yyyy-mm-dd":
      return "YYYY-MM-DD"
    case "mm":
      return "MM"
    case "mm-dd":
      return "MM-DD"
    case "yyyy-mm-dd hh:mm":
      return "YYYY-MM-DD HH:MM"
    case "hh:mm":
      return "HH:MM"
  }
}
