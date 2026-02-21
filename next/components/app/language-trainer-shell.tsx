"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import type { LucideIcon } from "lucide-react"
import {
  BookOpenIcon,
  CalendarDaysIcon,
  HashIcon,
  HomeIcon,
  MenuIcon,
  MicIcon,
  MonitorIcon,
  MoonIcon,
  SettingsIcon,
  SunIcon,
  UserIcon,
} from "lucide-react"

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
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  DEFAULT_MIGRATED_SETTINGS,
  MIGRATION_MENU,
  type MenuId,
  type MigratedUserSettings,
} from "@/lib/web-migration"
import { authClient } from "@/lib/auth-client"
import { ComprehensionTrainer } from "@/components/trainers/comprehension-trainer"
import { DateTrainer } from "@/components/trainers/date-trainer"
import { NumberTrainer } from "@/components/trainers/number-trainer"

const MENU_STORAGE_KEY = "selectedMenu"
const SETTINGS_STORAGE_KEY = "next.migratedSettings"

const APP_LANGUAGE_OPTIONS = [
  { label: "English (US)", value: "en-US" },
  { label: "Japanese (Japan)", value: "ja-JP" },
]

const TARGET_LANGUAGE_OPTIONS = [
  { label: "English", value: "en" },
  { label: "Japanese", value: "ja" },
  { label: "Spanish", value: "es" },
  { label: "French", value: "fr" },
]

const LEVEL_OPTIONS = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
]

const THEME_OPTIONS = [
  { label: "System", value: "system", icon: MonitorIcon },
  { label: "Light", value: "light", icon: SunIcon },
  { label: "Dark", value: "dark", icon: MoonIcon },
] as const

const menuIconById: Record<MenuId, LucideIcon> = {
  home: HomeIcon,
  speaking: MicIcon,
  name: UserIcon,
  comprehension: BookOpenIcon,
  date: CalendarDaysIcon,
  number: HashIcon,
  settings: SettingsIcon,
}

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

function getInitialMenu(): MenuId {
  if (typeof window === "undefined") {
    return "home"
  }

  const storedMenu = localStorage.getItem(MENU_STORAGE_KEY) as MenuId | null
  if (storedMenu && MIGRATION_MENU.some((item) => item.id === storedMenu)) {
    return storedMenu
  }
  return "home"
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

export function LanguageTrainerShell() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [isNavOpen, setIsNavOpen] = useState(true)
  const [selectedMenu, setSelectedMenu] = useState<MenuId>(getInitialMenu)
  const [settings, setSettings] = useState<MigratedUserSettings>(
    getInitialSettings
  )
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    localStorage.setItem(MENU_STORAGE_KEY, selectedMenu)
  }, [selectedMenu])

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
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

  const selectedMenuItem = useMemo(
    () => MIGRATION_MENU.find((item) => item.id === selectedMenu),
    [selectedMenu]
  )

  const trainerItems = MIGRATION_MENU.filter((item) => item.section === "trainers")
  const systemItems = MIGRATION_MENU.filter((item) => item.section === "system")

  const handleMenuSelect = (menu: MenuId) => {
    setSelectedMenu((current) => (current === menu ? "home" : menu))
  }

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      const { error } = await authClient.signOut()
      if (error) {
        return
      }
      router.replace("/")
    } finally {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Toggle menu"
            onClick={() => setIsNavOpen((current) => !current)}
          >
            <MenuIcon />
          </Button>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              Walden&apos;s AI Language Trainer
            </p>
          </div>
          <Select
            items={THEME_OPTIONS}
            value={settings.theme}
            onValueChange={(value) =>
              setSettings((current) => ({
                ...current,
                theme: (value as MigratedUserSettings["theme"]) ?? "system",
              }))
            }
          >
            <SelectTrigger aria-label="Theme" className="ml-auto w-28" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {THEME_OPTIONS.map((option) => {
                  const Icon = option.icon
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <Icon />
                      {option.label}
                    </SelectItem>
                  )
                })}
              </SelectGroup>
            </SelectContent>
          </Select>
          {session?.user ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void handleSignOut()}
              disabled={isSigningOut}
            >
              {isSigningOut ? "Signing out..." : "Sign out"}
            </Button>
          ) : null}
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-4 p-4">
        <aside
          className={cn(
            "w-full shrink-0 rounded-xl border bg-card p-3 md:w-64",
            !isNavOpen && "hidden"
          )}
        >
          <p className="px-2 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Trainers
          </p>
          <nav className="space-y-1">
            {trainerItems.map((item) => {
              const Icon = menuIconById[item.id]
              return (
                <Button
                  key={item.id}
                  variant={selectedMenu === item.id ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleMenuSelect(item.id)}
                >
                  <Icon />
                  {item.label}
                  {item.status === "pending" ? (
                    <Badge variant="outline" className="ml-auto">
                      pending
                    </Badge>
                  ) : null}
                </Button>
              )
            })}
          </nav>

          <Separator className="my-3" />

          <p className="px-2 pb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            System
          </p>
          <nav className="space-y-1">
            {systemItems.map((item) => {
              const Icon = menuIconById[item.id]
              return (
                <Button
                  key={item.id}
                  variant={selectedMenu === item.id ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleMenuSelect(item.id)}
                >
                  <Icon />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          {selectedMenu === "home" ? <HomeScreen /> : null}
          {selectedMenu === "settings" ? (
            <SettingsScreen
              settings={settings}
              onChange={(nextSettings) => setSettings(nextSettings)}
              onReset={() => setSettings(DEFAULT_MIGRATED_SETTINGS)}
            />
          ) : null}
          {selectedMenu === "number" ? (
            <NumberTrainer
              settings={settings}
              onSettingsChange={(nextSettings) => setSettings(nextSettings)}
            />
          ) : null}
          {selectedMenu === "date" ? (
            <DateTrainer
              settings={settings}
              onSettingsChange={(nextSettings) => setSettings(nextSettings)}
            />
          ) : null}
          {selectedMenu === "comprehension" ? (
            <ComprehensionTrainer settings={settings} />
          ) : null}
          {selectedMenu !== "home" &&
          selectedMenu !== "settings" &&
          selectedMenu !== "number" &&
          selectedMenu !== "date" &&
          selectedMenu !== "comprehension" ? (
            <TrainerPlaceholder menuId={selectedMenu} />
          ) : null}
        </main>
      </div>
    </div>
  )
}

function HomeScreen() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Migration Started in Next.js</CardTitle>
        <CardDescription>
          This shell replaces the placeholder page and is now the primary web
          migration entry point in <code>next/*</code>.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 leading-relaxed">
        <p>
          Before you get started, here are a few notes on using this app.
          Language trainers are designed for practicing specific functions of the
          language.
        </p>
        <p>
          AI grading can help identify missing details in responses, but use your
          own judgment when interpreting model output.
        </p>
        <p className="text-muted-foreground">
          During migration, trainer experiences are being ported incrementally
          from legacy <code>src/*</code> into <code>next/*</code>.
        </p>
      </CardContent>
    </Card>
  )
}

function SettingsScreen({
  settings,
  onChange,
  onReset,
}: {
  settings: MigratedUserSettings
  onChange: (nextSettings: MigratedUserSettings) => void
  onReset: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings (Migrated Baseline)</CardTitle>
        <CardDescription>
          These are temporary client-side settings used while account-backed
          persistence is implemented.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="app-language">App Language</Label>
            <Select
              items={APP_LANGUAGE_OPTIONS}
              value={settings.appLanguage}
              onValueChange={(value) =>
                onChange({
                  ...settings,
                  appLanguage: (value as string) ?? settings.appLanguage,
                })
              }
            >
              <SelectTrigger id="app-language" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {APP_LANGUAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-language">Target Language</Label>
            <Select
              items={TARGET_LANGUAGE_OPTIONS}
              value={settings.targetLanguage}
              onValueChange={(value) =>
                onChange({
                  ...settings,
                  targetLanguage: (value as string) ?? settings.targetLanguage,
                })
              }
            >
              <SelectTrigger id="target-language" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TARGET_LANGUAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="target-level">Target Language Level</Label>
            <Select
              items={LEVEL_OPTIONS}
              value={settings.targetLanguageLevel}
              onValueChange={(value) =>
                onChange({
                  ...settings,
                  targetLanguageLevel:
                    (value as MigratedUserSettings["targetLanguageLevel"]) ??
                    settings.targetLanguageLevel,
                })
              }
            >
              <SelectTrigger id="target-level" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {LEVEL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="volume">Volume</Label>
            <Input
              id="volume"
              type="number"
              min={0}
              max={100}
              value={settings.volume}
              onChange={(event) => {
                const volume = Number(event.target.value)
                if (Number.isNaN(volume)) {
                  return
                }
                onChange({
                  ...settings,
                  volume: Math.min(100, Math.max(0, volume)),
                })
              }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Persisted to local storage until database-backed user settings are
          added.
        </p>
        <Button variant="outline" onClick={onReset}>
          Reset
        </Button>
      </CardFooter>
    </Card>
  )
}

function TrainerPlaceholder({
  menuId,
}: {
  menuId: Exclude<MenuId, "home" | "settings" | "number" | "date" | "comprehension">
}) {
  const label = MIGRATION_MENU.find((item) => item.id === menuId)?.label ?? menuId

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label} Trainer Migration Queue</CardTitle>
        <CardDescription>
          This screen is reserved for the trainer port from legacy React SPA to
          Next.js route handlers and client components.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>1. Port trainer menu and round-flow UI from legacy `src/ui/*`.</p>
        <p>2. Move AI generation/evaluation to first-party Next API endpoints.</p>
        <p>3. Replace local-only state with authenticated server persistence.</p>
      </CardContent>
    </Card>
  )
}
