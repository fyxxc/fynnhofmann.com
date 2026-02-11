"use client"

import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Shield, User } from "lucide-react"

export function SettingsSection({ userEmail }: { userEmail: string }) {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Account and preferences.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Account Info */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <User className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Account</p>
              <p className="text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <div className="rounded-lg bg-secondary/50 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Your account is authenticated via Supabase. Manage your email and
              password through the authentication provider.
            </p>
          </div>
        </div>

        {/* Security */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-muted-foreground">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Security</p>
              <p className="text-xs text-muted-foreground">
                Session management
              </p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="rounded-lg border-border text-foreground hover:border-destructive hover:text-destructive bg-transparent"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out of all sessions
          </Button>
        </div>
      </div>
    </div>
  )
}
