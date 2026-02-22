"use client"

import { useMigratedSettings } from "@/components/app/migrated-settings-context"
import { ComprehensionTrainer } from "@/components/trainers/comprehension-trainer"

export default function ComprehensionTrainerPage() {
  const { settings } = useMigratedSettings()

  return <ComprehensionTrainer settings={settings} />
}
