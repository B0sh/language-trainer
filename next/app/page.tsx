"use client"

import Link from "next/link"

import { authClient } from "@/lib/auth-client"

export default function Page() {
  const { data: session, isPending } = authClient.useSession()
  const isLoggedIn = Boolean(session?.user)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Language Trainer</h1>
      <p className="text-muted-foreground mt-4 max-w-xl text-base">
        A lightweight landing page for the new auth flow while the app buildout
        continues.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {isLoggedIn ? (
          <>
            <Link
              href="/app"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Open app
            </Link>
            <Link
              href="/signout"
              className="border-border hover:bg-muted rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            >
              Sign out
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/signin"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="border-border hover:bg-muted rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
      {isPending ? (
        <p className="text-muted-foreground mt-4 text-sm">Checking session...</p>
      ) : null}
    </main>
  )
}
