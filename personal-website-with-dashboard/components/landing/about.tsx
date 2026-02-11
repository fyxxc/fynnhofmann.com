import Image from "next/image"
import { Code2, Layers, Zap } from "lucide-react"

const traits = [
  {
    icon: Code2,
    title: "Systems Thinker",
    description:
      "I approach problems architecturally. Every line of code serves a purpose within a larger system.",
  },
  {
    icon: Layers,
    title: "Full-Stack Builder",
    description:
      "From database schemas to pixel-perfect interfaces. I build the entire stack with equal precision.",
  },
  {
    icon: Zap,
    title: "Performance Driven",
    description:
      "Speed is a feature. I optimize for real-world performance, not just benchmarks.",
  },
]

export function About() {
  return (
    <section id="about" className="px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
              About
            </p>
            <h2 className="max-w-xl text-balance text-3xl font-bold tracking-tight text-foreground">
              Not a resume. A signal.
            </h2>
            <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
              I build tools, platforms, and interfaces that are functional first
              and beautiful by consequence. This space is where I organize my
              thinking and ship work that matters.
            </p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image
              src="/images/about.jpg"
              alt="Wireframes and architecture sketches on a desk"
              fill
              className="object-cover"
            />
          </div>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {traits.map((trait) => (
            <div
              key={trait.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-accent/40 hover:shadow-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-foreground transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                <trait.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">
                {trait.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {trait.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
