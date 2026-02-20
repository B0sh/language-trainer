export type NumberDifficulty = "easy" | "medium" | "hard"

export interface NumberRoundGenerator {
  type: "random"
  weight: number
  min: number
  max: number
  multiplier?: number
}

export interface NumberRoundConfig {
  label: NumberDifficulty
  helpText: string
  generators: NumberRoundGenerator[]
}

export const NUMBER_DIFFICULTY_CONFIGS: NumberRoundConfig[] = [
  {
    label: "easy",
    helpText: "Generate numbers up to 99.",
    generators: [{ type: "random", weight: 1, min: 1, max: 99 }],
  },
  {
    label: "medium",
    helpText: "Generate numbers up to 10,000.",
    generators: [
      { type: "random", weight: 10, min: 1, max: 9, multiplier: 10 },
      { type: "random", weight: 30, min: 1, max: 9, multiplier: 100 },
      { type: "random", weight: 30, min: 1, max: 10, multiplier: 1000 },
    ],
  },
  {
    label: "hard",
    helpText: "Generate larger numbers with two significant digits.",
    generators: [
      { type: "random", weight: 1, min: 10, max: 99, multiplier: 10 },
      { type: "random", weight: 1, min: 1, max: 99, multiplier: 100 },
      { type: "random", weight: 1, min: 1, max: 99, multiplier: 100000 },
      { type: "random", weight: 1, min: 1, max: 99, multiplier: 10000000 },
    ],
  },
]

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getWeightedRandomGenerator(
  generators: NumberRoundGenerator[]
): NumberRoundGenerator {
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

export function resolveDifficulty(value: unknown): NumberDifficulty {
  if (value === "medium" || value === "hard" || value === "easy") {
    return value
  }
  return "easy"
}

export function generateNumberByDifficulty(difficulty: NumberDifficulty): number {
  const config = NUMBER_DIFFICULTY_CONFIGS.find(
    (round) => round.label === difficulty
  )

  if (!config) {
    return getRandomInt(1, 99)
  }

  const generator = getWeightedRandomGenerator(config.generators)
  return (
    getRandomInt(generator.min, generator.max) * (generator.multiplier ?? 1)
  )
}

export function formatSpokenText(
  number: number,
  targetLanguage: string,
  sentenceMode: boolean
): string {
  if (!sentenceMode) {
    return `${number}`
  }

  switch (targetLanguage) {
    case "ja":
      return `数字は${number}です。`
    case "es":
      return `El numero es ${number}.`
    case "fr":
      return `Le nombre est ${number}.`
    default:
      return `The number is ${number}.`
  }
}
