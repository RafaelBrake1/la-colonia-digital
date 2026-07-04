"use server"

import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { createSession, deleteSession } from "@/lib/session"

export async function login(
  _prevState: { error: string } | null,
  formData: FormData
): Promise<{ error: string } | null> {
  const email = (formData.get("email") as string)?.trim().toLowerCase()
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email y contraseña son requeridos." }
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user) {
    return { error: "Credenciales incorrectas." }
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatch) {
    return { error: "Credenciales incorrectas." }
  }

  await createSession(user.id, user.email)
  redirect("/admin")
}

export async function logout() {
  await deleteSession()
  redirect("/admin/login")
}
