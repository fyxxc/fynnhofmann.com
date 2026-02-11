"use client"

import { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Note {
  id: string
  title: string
  content: string
  date: string
}

const initialNotes: Note[] = [
  {
    id: "1",
    title: "API Design Patterns",
    content:
      "RESTful conventions vs GraphQL for the new data layer. Need to benchmark query performance.",
    date: "Feb 10, 2026",
  },
  {
    id: "2",
    title: "Infrastructure Roadmap",
    content:
      "Migrate to edge runtime for auth gateway. Consider Cloudflare Workers for global latency reduction.",
    date: "Feb 8, 2026",
  },
  {
    id: "3",
    title: "Component Architecture",
    content:
      "Composition over configuration. Build primitive components that compose into complex UI patterns.",
    date: "Feb 5, 2026",
  },
]

export function NotesSection() {
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [newTitle, setNewTitle] = useState("")

  const addNote = () => {
    if (!newTitle.trim()) return
    const note: Note = {
      id: Date.now().toString(),
      title: newTitle,
      content: "Start writing...",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    }
    setNotes([note, ...notes])
    setNewTitle("")
  }

  const removeNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id))
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Notes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quick ideas, references, and technical thoughts.
        </p>
      </div>

      {/* Add Note */}
      <div className="mb-8 flex gap-3">
        <Input
          placeholder="New note title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addNote()}
          className="h-11 flex-1 rounded-lg border-border bg-card"
        />
        <Button
          onClick={addNote}
          className="h-11 rounded-lg bg-accent text-accent-foreground hover:bg-accent/90"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Notes List */}
      <div className="flex flex-col gap-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-accent/40"
          >
            <div className="mb-2 flex items-start justify-between">
              <h3 className="text-sm font-semibold text-foreground">
                {note.title}
              </h3>
              <button
                type="button"
                onClick={() => removeNote(note.id)}
                className="rounded-md p-1 text-muted-foreground/40 opacity-0 transition-all hover:text-destructive group-hover:opacity-100"
                aria-label={`Delete ${note.title}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              {note.content}
            </p>
            <p className="text-xs text-muted-foreground/60">{note.date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
