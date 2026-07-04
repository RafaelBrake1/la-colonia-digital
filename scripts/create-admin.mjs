/**
 * Script para crear el usuario admin inicial en la base de datos.
 *
 * Uso:
 *   1. Asegúrate de tener .env.local con DATABASE_URL
 *   2. node scripts/create-admin.mjs
 */

import { neon } from "@neondatabase/serverless"
import bcrypt from "bcryptjs"
import readline from "readline"

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const ask = (q) => new Promise((res) => rl.question(q, res))

async function main() {
  const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING
  if (!dbUrl) {
    console.error("❌  No se encontró ninguna variable de base de datos.")
    console.error("    Define una de estas antes del comando:")
    console.error("    DATABASE_URL=\"postgresql://...\" node scripts/create-admin.mjs")
    console.error("    POSTGRES_URL=\"postgresql://...\" node scripts/create-admin.mjs")
    process.exit(1)
  }

  console.log("🔐  Crear usuario admin — La Colonia Digital\n")
  const name = await ask("Nombre: ")
  const email = (await ask("Email: ")).trim().toLowerCase()
  const password = await ask("Contraseña (min 8 chars): ")

  if (!email || !password || password.length < 8) {
    console.error("❌  Email o contraseña inválidos.")
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const sql = neon(dbUrl)

  await sql`
    INSERT INTO users (email, password_hash, name)
    VALUES (${email}, ${passwordHash}, ${name})
    ON CONFLICT (email) DO UPDATE SET password_hash = ${passwordHash}, name = ${name}
  `

  console.log(`\n✅  Usuario admin creado: ${email}`)
  rl.close()
}

main().catch((err) => {
  console.error("❌", err.message)
  process.exit(1)
})
