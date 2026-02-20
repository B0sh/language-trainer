export type MenuId =
  | "home"
  | "speaking"
  | "name"
  | "comprehension"
  | "date"
  | "number"
  | "settings"

export interface MigratedUserSettings {
  appLanguage: string
  targetLanguage: string
  targetLanguageLevel: "low" | "medium" | "high"
  theme: "light" | "dark" | "system"
  volume: number
  numberTrainerDifficulty: "easy" | "medium" | "hard"
  numberTrainerGenSentence: boolean
  dateTrainerDifficulty: "easy" | "medium" | "hard"
  dateTrainerGenSentence: boolean
}

export const DEFAULT_MIGRATED_SETTINGS: MigratedUserSettings = {
  appLanguage: "en-US",
  targetLanguage: "en",
  targetLanguageLevel: "high",
  theme: "system",
  volume: 80,
  numberTrainerDifficulty: "easy",
  numberTrainerGenSentence: false,
  dateTrainerDifficulty: "easy",
  dateTrainerGenSentence: false,
}

export const MIGRATION_MENU: ReadonlyArray<{
  id: MenuId
  label: string
  section: "trainers" | "system"
  status: "active" | "pending"
}> = [
  { id: "home", label: "Home", section: "trainers", status: "active" },
  { id: "speaking", label: "Speaking", section: "trainers", status: "pending" },
  { id: "name", label: "Name", section: "trainers", status: "pending" },
  {
    id: "comprehension",
    label: "Comprehension",
    section: "trainers",
    status: "active",
  },
  { id: "date", label: "Date", section: "trainers", status: "active" },
  { id: "number", label: "Number", section: "trainers", status: "active" },
  { id: "settings", label: "Settings", section: "system", status: "active" },
]
