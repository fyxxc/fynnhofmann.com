"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

interface Project {
  id: string
  name: string
  description: string
  status: "active" | "paused" | "completed"
  tag: string
}

const initialProjects: Project[] = [
  {
    id: "1",
    name: "Distributed Task Engine",
    description:
      "Fault-tolerant task orchestration for high-throughput workloads. Currently in v2 redesign phase.",
    status: "active",
    tag: "Infrastructure",
  },
  {
    id: "2",
    name: "Real-Time Analytics",
    description:
      "Streaming pipeline with sub-second latency. Ingesting 50k events/sec in production.",
    status: "active",
    tag: "Data",
  },
  {
    id: "3",
    name: "Auth Gateway",
    description:
      "Zero-trust authentication proxy. Rate limiting and session management across services.",
    status: "completed",
    tag: "Security",
  },
  {
    id: "4",
    name: "Design System",
    description:
      "Accessibility-first component library with composable primitives and theme tokens.",
    status: "paused",
    tag: "Frontend",
  },
]

const statusColors: Record<Project["status"], string> = {
  active: "bg-accent text-accent-foreground",
  paused: "bg-secondary text-muted-foreground",
  completed: "bg-primary text-primary-foreground",
}

const statusLabels: Record<Project["status"], string> = {
  active: "Active",
  paused: "Paused",
  completed: "Completed",
}

export function ProjectsSection() {
  const [projects, setProjects] = useState<Project[]>(initialProjects)

  const cycleStatus = (id: string) => {
    setProjects(
      projects.map((p) => {
        if (p.id !== id) return p
        const order: Project["status"][] = ["active", "paused", "completed"]
        const next = order[(order.indexOf(p.status) + 1) % order.length]
        return { ...p, status: next }
      })
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Projects
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage and track your active work.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/40"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-muted-foreground">
                {project.tag}
              </span>
              <button
                type="button"
                onClick={() => cycleStatus(project.id)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  statusColors[project.status]
                )}
              >
                {statusLabels[project.status]}
              </button>
            </div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">
              {project.name}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
