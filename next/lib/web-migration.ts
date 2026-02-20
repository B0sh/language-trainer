export type MenuId =
  | "home"
  | "speaking"
  | "comprehension"
  | "date"
  | "number"
  | "settings"
  | "ai-settings"
  | "ai-logs"

export interface MigratedUserSettings {
  appLanguage: string
  targetLanguage: string
  targetLanguageLevel: "low" | "medium" | "high"
  theme: "light" | "dark" | "system"
  volume: number
}

export const DEFAULT_MIGRATED_SETTINGS: MigratedUserSettings = {
  appLanguage: "en-US",
  targetLanguage: "en",
  targetLanguageLevel: "high",
  theme: "system",
  volume: 80,
}

export const MIGRATION_MENU: ReadonlyArray<{
  id: MenuId
  label: string
  section: "trainers" | "system"
  status: "active" | "removed" | "pending"
}> = [
  { id: "home", label: "Home", section: "trainers", status: "active" },
  { id: "speaking", label: "Speaking", section: "trainers", status: "pending" },
  {
    id: "comprehension",
    label: "Comprehension",
    section: "trainers",
    status: "pending",
  },
  { id: "date", label: "Date", section: "trainers", status: "pending" },
  { id: "number", label: "Number", section: "trainers", status: "pending" },
  { id: "settings", label: "Settings", section: "system", status: "active" },
  {
    id: "ai-settings",
    label: "AI Providers",
    section: "system",
    status: "removed",
  },
  { id: "ai-logs", label: "AI Logs", section: "system", status: "removed" },
]
