import { FileText, FolderKanban, Clock, Activity } from "lucide-react"

const stats = [
  { label: "Notes", value: "12", icon: FileText },
  { label: "Projects", value: "4", icon: FolderKanban },
  { label: "Hours Logged", value: "186", icon: Clock },
  { label: "Active Tasks", value: "7", icon: Activity },
]

const recentActivity = [
  { action: "Updated", target: "Auth Gateway project", time: "2 hours ago" },
  { action: "Created", target: "API design patterns note", time: "5 hours ago" },
  { action: "Completed", target: "Database migration task", time: "1 day ago" },
  { action: "Published", target: "Design System v2.0", time: "2 days ago" },
]

export function OverviewSection() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A snapshot of your workspace.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="mb-10 grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/40"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
              <stat.icon className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Recent Activity
        </h2>
        <div className="rounded-xl border border-border bg-card">
          {recentActivity.map((item, i) => (
            <div
              key={`${item.target}-${i}`}
              className="flex items-center justify-between border-b border-border px-5 py-4 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-accent" />
                <p className="text-sm text-foreground">
                  <span className="font-medium">{item.action}</span>{" "}
                  {item.target}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">{item.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
