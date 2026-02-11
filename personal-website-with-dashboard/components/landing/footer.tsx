import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center">
          <h2 className="mb-4 text-2xl font-bold tracking-tight text-foreground">
            Ready to explore?
          </h2>
          <p className="mb-8 max-w-md text-muted-foreground leading-relaxed">
            The dashboard is where the real work lives. Sign in to access
            projects, notes, and settings.
          </p>
          <Link
            href="/auth/login"
            className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition-all hover:gap-3 hover:shadow-lg hover:shadow-accent/20"
          >
            Access Dashboard
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <div className="mt-16 flex items-center justify-between border-t border-border pt-8">
          <p className="text-xs text-muted-foreground">
            identity<span className="text-accent">.</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {"Built with precision."}
          </p>
        </div>
      </div>
    </footer>
  )
}
