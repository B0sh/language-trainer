"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"

export default function SignOutPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    const run = async () => {
      try {
        const { error: signOutError } = await authClient.signOut()

        if (!active) return
        if (signOutError) {
          setError(signOutError.message ?? "Unable to sign out.")
          return
        }

        router.replace("/")
      } catch {
        if (active) {
          setError("Unable to sign out.")
        }
      }
    }

    void run()

    return () => {
      active = false
    }
  }, [router])

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Signing out</CardTitle>
          <CardDescription>Ending your session.</CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="grid gap-2">
              <p className="text-destructive text-sm" aria-live="polite">
                {error}
              </p>
              <Link href="/" className="text-primary text-sm hover:underline">
                Back to home
              </Link>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Please wait...</p>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
