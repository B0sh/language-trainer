"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

import { LanguageTrainerShellLayout } from "@/components/app/language-trainer-shell-layout"
import { MigratedSettingsProvider } from "@/components/app/migrated-settings-context"
import { authClient } from "@/lib/auth-client"

export function ProtectedAppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { data: session, isPending } = authClient.useSession()
  const isLoggedIn = Boolean(session?.user)

  useEffect(() => {
    if (isPending || isLoggedIn) {
      return
    }

    const callbackURL = encodeURIComponent(pathname || "/app")
    router.replace(`/signin?callbackURL=${callbackURL}`)
  }, [isLoggedIn, isPending, pathname, router])

  if (isPending || !isLoggedIn) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="text-muted-foreground text-sm">Checking session...</p>
      </main>
    )
  }

  return (
    <MigratedSettingsProvider>
      <LanguageTrainerShellLayout>{children}</LanguageTrainerShellLayout>
    </MigratedSettingsProvider>
  )
}
