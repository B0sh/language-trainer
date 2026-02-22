"use client"

import { useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
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

import { useMigratedSettings } from "@/components/app/migrated-settings-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { MIGRATION_MENU, type MenuId, type MigratedUserSettings } from "@/lib/web-migration"

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

function isRouteActive(pathname: string, href: string): boolean {
  if (href === "/app") {
    return pathname === "/app"
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function LanguageTrainerShellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const { settings, setSettings } = useMigratedSettings()
  const [isNavOpen, setIsNavOpen] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const trainerItems = useMemo(
    () => MIGRATION_MENU.filter((item) => item.section === "trainers"),
    []
  )
  const systemItems = useMemo(
    () => MIGRATION_MENU.filter((item) => item.section === "system"),
    []
  )

  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      const { error } = await authClient.signOut()
      if (!error) {
        router.replace("/")
      }
    } finally {
      setIsSigningOut(false)
    }
  }

  const handleThemeChange = (value: string | null) => {
    setSettings((current) => ({
      ...current,
      theme: (value as MigratedUserSettings["theme"]) ?? "system",
    }))
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
            onValueChange={handleThemeChange}
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
              const isActive = isRouteActive(pathname, item.href)
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => router.push(item.href)}
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
              const isActive = isRouteActive(pathname, item.href)
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => router.push(item.href)}
                >
                  <Icon />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  )
}
