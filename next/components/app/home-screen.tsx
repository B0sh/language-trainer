import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function HomeScreen() {
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
