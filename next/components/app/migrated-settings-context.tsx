"use client"

import {
  createContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react"

import {
  DEFAULT_MIGRATED_SETTINGS,
  type MigratedUserSettings,
} from "@/lib/web-migration"

const SETTINGS_STORAGE_KEY = "next.migratedSettings"

interface MigratedSettingsContextValue {
  settings: MigratedUserSettings
  setSettings: Dispatch<SetStateAction<MigratedUserSettings>>
}

const MigratedSettingsContext =
  createContext<MigratedSettingsContextValue | null>(null)

function applyTheme(theme: MigratedUserSettings["theme"]) {
  const root = document.documentElement
  const resolvedTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme

  root.classList.toggle("dark", resolvedTheme === "dark")
}

function getInitialSettings(): MigratedUserSettings {
  if (typeof window === "undefined") {
    return DEFAULT_MIGRATED_SETTINGS
  }

  const storedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY)
  if (!storedSettings) {
    return DEFAULT_MIGRATED_SETTINGS
  }

  try {
    const parsed = JSON.parse(storedSettings) as Partial<MigratedUserSettings>
    return {
      ...DEFAULT_MIGRATED_SETTINGS,
      ...parsed,
    }
  } catch {
    return DEFAULT_MIGRATED_SETTINGS
  }
}

export function MigratedSettingsProvider({
  children,
}: {
  children: ReactNode
}) {
  const [settings, setSettings] = useState<MigratedUserSettings>(
    getInitialSettings
  )

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  useEffect(() => {
    applyTheme(settings.theme)
    if (settings.theme !== "system") {
      return
    }

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => applyTheme("system")
    mediaQuery.addEventListener("change", onChange)

    return () => {
      mediaQuery.removeEventListener("change", onChange)
    }
  }, [settings.theme])

  return (
    <MigratedSettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </MigratedSettingsContext.Provider>
  )
}

export function useMigratedSettings() {
  const context = useContext(MigratedSettingsContext)
  if (!context) {
    throw new Error(
      "useMigratedSettings must be used within a MigratedSettingsProvider."
    )
  }
  return context
}
