"use client"

import { useMigratedSettings } from "@/components/app/migrated-settings-context"
import { DateTrainer } from "@/components/trainers/date-trainer"

export default function DateTrainerPage() {
  const { settings, setSettings } = useMigratedSettings()

  return (
    <DateTrainer
      settings={settings}
      onSettingsChange={(nextSettings) => setSettings(nextSettings)}
    />
  )
}
