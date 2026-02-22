"use client"

import { useMigratedSettings } from "@/components/app/migrated-settings-context"
import { NumberTrainer } from "@/components/trainers/number-trainer"

export default function NumberTrainerPage() {
  const { settings, setSettings } = useMigratedSettings()

  return (
    <NumberTrainer
      settings={settings}
      onSettingsChange={(nextSettings) => setSettings(nextSettings)}
    />
  )
}
