import Image from "next/image"
import { ExternalLink } from "lucide-react"

const projects = [
  {
    title: "Distributed Task Engine",
    tag: "Infrastructure",
    description:
      "A fault-tolerant task orchestration system built for high-throughput workloads.",
    image: "/images/project-1.jpg",
  },
  {
    title: "Real-Time Analytics",
    tag: "Data",
    description:
      "Streaming data pipeline with sub-second latency for live dashboard metrics.",
    image: "/images/project-2.jpg",
  },
  {
    title: "Auth Gateway",
    tag: "Security",
    description:
      "Zero-trust authentication proxy with rate limiting and session management.",
    image: "/images/project-3.jpg",
  },
  {
    title: "Design System",
    tag: "Frontend",
    description:
      "Component library with accessibility-first tokens, themes, and composable primitives.",
    image: "/images/project-4.jpg",
  },
]

export function Projects() {
  return (
    <section id="projects" className="bg-secondary/50 px-6 py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
            Projects
          </p>
          <h2 className="max-w-xl text-balance text-3xl font-bold tracking-tight text-foreground">
            Selected work.
          </h2>
          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            A curated selection of systems and interfaces I have designed and
            built.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <div
              key={project.title}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-accent/40 hover:shadow-md"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                  src={project.image || "/placeholder.svg"}
                  alt={`${project.title} project visual`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-foreground/10 transition-opacity group-hover:opacity-0" />
              </div>
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                    {project.tag}
                  </span>
                  <ExternalLink className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-accent" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {project.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
