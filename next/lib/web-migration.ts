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
  href: string
  section: "trainers" | "system"
  status: "active" | "pending"
}> = [
  {
    id: "home",
    label: "Home",
    href: "/app",
    section: "trainers",
    status: "active",
  },
  {
    id: "speaking",
    label: "Speaking",
    href: "/app/trainer/speaking",
    section: "trainers",
    status: "pending",
  },
  {
    id: "name",
    label: "Name",
    href: "/app/trainer/name",
    section: "trainers",
    status: "pending",
  },
  {
    id: "comprehension",
    label: "Comprehension",
    href: "/app/trainer/comprehension",
    section: "trainers",
    status: "active",
  },
  {
    id: "date",
    label: "Date",
    href: "/app/trainer/date",
    section: "trainers",
    status: "active",
  },
  {
    id: "number",
    label: "Number",
    href: "/app/trainer/number",
    section: "trainers",
    status: "active",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/app/settings",
    section: "system",
    status: "active",
  },
]
