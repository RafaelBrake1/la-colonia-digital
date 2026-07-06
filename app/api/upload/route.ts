import { put, del } from "@vercel/blob"
import { NextResponse } from "next/server"
import { getSession } from "@/lib/session"

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const form = await request.formData()
  const file = form.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 })
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json(
      { error: "Tipo de archivo no permitido. Solo se aceptan JPG, PNG, WebP y GIF." },
      { status: 400 }
    )
  }

  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: "El archivo supera el límite de 4MB." }, { status: 400 })
  }

  const blob = await put(`noticias/${Date.now()}-${file.name}`, file, {
    access: "public",
  })

  return NextResponse.json({ url: blob.url })
}

export async function DELETE(request: Request): Promise<NextResponse> {
  const session = await getSession()
  if (!session?.userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = (await request.json()) as { urls: string[] }
  const urls = body?.urls
  if (!Array.isArray(urls) || urls.length === 0) {
    return NextResponse.json({ error: "URLs requeridas" }, { status: 400 })
  }

  await Promise.allSettled(urls.map((url) => del(url)))
  return NextResponse.json({ ok: true })
}
