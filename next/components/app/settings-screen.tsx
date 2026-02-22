"use client"

import { useMigratedSettings } from "@/components/app/migrated-settings-context"
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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DEFAULT_MIGRATED_SETTINGS,
  type MigratedUserSettings,
} from "@/lib/web-migration"

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

export function SettingsScreen() {
  const { settings, setSettings } = useMigratedSettings()

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
                setSettings((current) => ({
                  ...current,
                  appLanguage: (value as string) ?? current.appLanguage,
                }))
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
                setSettings((current) => ({
                  ...current,
                  targetLanguage: (value as string) ?? current.targetLanguage,
                }))
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
                setSettings((current) => ({
                  ...current,
                  targetLanguageLevel:
                    (value as MigratedUserSettings["targetLanguageLevel"]) ??
                    current.targetLanguageLevel,
                }))
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
                setSettings((current) => ({
                  ...current,
                  volume: Math.min(100, Math.max(0, volume)),
                }))
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
        <Button
          variant="outline"
          onClick={() => setSettings(DEFAULT_MIGRATED_SETTINGS)}
        >
          Reset
        </Button>
      </CardFooter>
    </Card>
  )
}
