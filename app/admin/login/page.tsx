"use client"

import { useActionState } from "react"
import { login } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminLoginPage() {
  const [state, action, isPending] = useActionState(login, null)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/20">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center font-bold text-lg mb-3">
            LC
          </div>
          <h1 className="text-xl font-bold">Acceso Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">La Colonia Digital</p>
        </div>

        <form action={action} className="space-y-4">
          {state?.error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {state.error}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@ejemplo.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Ingresando…" : "Ingresar"}
          </Button>
        </form>
      </div>
    </div>
  )
}
