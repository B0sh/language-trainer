import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MIGRATION_MENU, type MenuId } from "@/lib/web-migration"

export function TrainerPlaceholder({
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
