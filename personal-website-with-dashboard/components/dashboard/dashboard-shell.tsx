"use client"

import { useState } from "react"
import { DashboardSidebar } from "./sidebar"
import { OverviewSection } from "./sections/overview"
import { NotesSection } from "./sections/notes"
import { ProjectsSection } from "./sections/projects"
import { SettingsSection } from "./sections/settings"

export type DashboardSection = "overview" | "notes" | "projects" | "settings"

export function DashboardShell({ userEmail }: { userEmail: string }) {
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("overview")

  return (
    <div className="flex min-h-svh bg-background">
      <DashboardSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        userEmail={userEmail}
      />
      <main className="flex-1 overflow-auto">
        <div className="animate-fade-in mx-auto max-w-4xl px-8 py-10">
          {activeSection === "overview" && <OverviewSection />}
          {activeSection === "notes" && <NotesSection />}
          {activeSection === "projects" && <ProjectsSection />}
          {activeSection === "settings" && (
            <SettingsSection userEmail={userEmail} />
          )}
        </div>
      </main>
    </div>
  )
}
