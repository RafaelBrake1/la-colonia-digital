"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { eq, sql, desc, asc, and, max } from "drizzle-orm"
import { db } from "@/lib/db"
import { articles, articleImages } from "@/lib/db/schema"
import { verifySession } from "@/lib/dal"
import type { ImagePosition, ImageSize, ArticleStatus } from "@/lib/constants"

export interface ImageInput {
  url: string
  alt: string
  caption?: string | null
  position: ImagePosition
  size: ImageSize
}

export interface ArticleInput {
  title: string
  excerpt: string
  content: string
  slug: string
  categories: string[]
  author: string
  status: ArticleStatus
  isFeatured: boolean
  publishedAt: string
  images: ImageInput[]
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

async function ensureUniqueSlug(slug: string, excludeId?: string): Promise<string> {
  let candidate = slug
  let suffix = 0
  while (true) {
    const query = db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, candidate))
    const [existing] = await query
    if (!existing || existing.id === excludeId) return candidate
    suffix++
    candidate = `${slug}-${suffix}`
  }
}

async function replaceImages(articleId: string, images: ImageInput[]) {
  await db.delete(articleImages).where(eq(articleImages.articleId, articleId))
  if (images.length === 0) return
  await db.insert(articleImages).values(
    images.map((img, i) => ({
      articleId,
      url: img.url,
      alt: img.alt,
      caption: img.caption ?? null,
      position: img.position,
      size: img.size,
      displayOrder: i,
    }))
  )
}

async function clearFeatured(exceptId?: string) {
  if (exceptId) {
    await db
      .update(articles)
      .set({ isFeatured: false, updatedAt: new Date() })
      .where(and(eq(articles.isFeatured, true), sql`id != ${exceptId}`))
  } else {
    await db
      .update(articles)
      .set({ isFeatured: false, updatedAt: new Date() })
      .where(eq(articles.isFeatured, true))
  }
}

export async function createArticle(input: ArticleInput) {
  await verifySession()

  const baseSlug = input.slug.trim() || generateSlug(input.title)
  const slug = await ensureUniqueSlug(baseSlug)

  const [{ maxOrder }] = await db
    .select({ maxOrder: max(articles.displayOrder) })
    .from(articles)
  const displayOrder = (maxOrder ?? -1) + 1

  if (input.isFeatured && input.status === "published") {
    await clearFeatured()
  }

  const [article] = await db
    .insert(articles)
    .values({
      title: input.title.trim(),
      excerpt: input.excerpt.trim(),
      content: input.content,
      slug,
      categories: input.categories,
      author: input.author.trim(),
      status: input.status,
      isFeatured: input.status === "published" ? input.isFeatured : false,
      displayOrder,
      publishedAt: new Date(input.publishedAt),
    })
    .returning()

  await replaceImages(article.id, input.images)

  revalidatePath("/")
  revalidatePath("/admin/noticias")
  redirect("/admin/noticias")
}

export async function updateArticle(id: string, input: ArticleInput) {
  await verifySession()

  const baseSlug = input.slug.trim() || generateSlug(input.title)
  const slug = await ensureUniqueSlug(baseSlug, id)

  if (input.isFeatured && input.status === "published") {
    await clearFeatured(id)
  }

  await db
    .update(articles)
    .set({
      title: input.title.trim(),
      excerpt: input.excerpt.trim(),
      content: input.content,
      slug,
      categories: input.categories,
      author: input.author.trim(),
      status: input.status,
      isFeatured: input.status === "published" ? input.isFeatured : false,
      publishedAt: new Date(input.publishedAt),
      updatedAt: new Date(),
    })
    .where(eq(articles.id, id))

  await replaceImages(id, input.images)

  revalidatePath("/")
  revalidatePath(`/noticias/${slug}`)
  revalidatePath("/admin/noticias")
  redirect("/admin/noticias")
}

export async function deleteArticle(id: string) {
  await verifySession()
  await db.delete(articles).where(eq(articles.id, id))
  revalidatePath("/")
  revalidatePath("/admin/noticias")
}

export async function archiveArticle(id: string) {
  await verifySession()
  await db
    .update(articles)
    .set({ status: "archived", isFeatured: false, updatedAt: new Date() })
    .where(eq(articles.id, id))
  revalidatePath("/")
  revalidatePath("/admin/noticias")
}

export async function restoreArticle(id: string) {
  await verifySession()
  await db
    .update(articles)
    .set({ status: "draft", updatedAt: new Date() })
    .where(eq(articles.id, id))
  revalidatePath("/admin/noticias")
}

export async function toggleFeatured(id: string, featured: boolean) {
  await verifySession()
  if (featured) {
    await clearFeatured(id)
  }
  await db
    .update(articles)
    .set({ isFeatured: featured, updatedAt: new Date() })
    .where(eq(articles.id, id))
  revalidatePath("/")
  revalidatePath("/admin/noticias")
}

export async function reorderArticles(orderedIds: string[]) {
  await verifySession()
  await Promise.all(
    orderedIds.map((id, index) =>
      db
        .update(articles)
        .set({ displayOrder: index, updatedAt: new Date() })
        .where(eq(articles.id, id))
    )
  )
  revalidatePath("/")
  revalidatePath("/admin/noticias")
}

export async function incrementViews(id: string) {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const key = `v_${id}`
  if (cookieStore.has(key)) return // ya contado en las últimas 24h
  await db
    .update(articles)
    .set({ views: sql`${articles.views} + 1` })
    .where(and(eq(articles.id, id), eq(articles.status, "published")))
  cookieStore.set(key, "1", {
    maxAge: 60 * 60 * 24, // 24 horas
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  })
}

// ─── Queries (server-side data fetching) ────────────────────────────────────

export async function getPublishedArticles(limit = 12) {
  return db.query.articles.findMany({
    where: eq(articles.status, "published"),
    orderBy: [desc(articles.displayOrder), desc(articles.publishedAt)],
    limit,
    with: { images: { orderBy: [asc(articleImages.displayOrder)] } },
  })
}

export async function getFeaturedArticle() {
  return db.query.articles.findFirst({
    where: and(eq(articles.status, "published"), eq(articles.isFeatured, true)),
    with: { images: { orderBy: [asc(articleImages.displayOrder)] } },
  })
}

export async function getArticleBySlug(slug: string) {
  return db.query.articles.findFirst({
    where: eq(articles.slug, slug),
    with: { images: { orderBy: [asc(articleImages.displayOrder)] } },
  })
}

export async function getArticleById(id: string) {
  return db.query.articles.findFirst({
    where: eq(articles.id, id),
    with: { images: { orderBy: [asc(articleImages.displayOrder)] } },
  })
}

export async function getArticlesByCategory(category: string, limit = 20) {
  return db.query.articles.findMany({
    where: and(
      eq(articles.status, "published"),
      sql`${articles.categories} @> ARRAY[${category}]::text[]`
    ),
    orderBy: [desc(articles.isFeatured), desc(articles.publishedAt)],
    limit,
    with: { images: { orderBy: [asc(articleImages.displayOrder)] } },
  })
}

export async function getTrendingArticles(limit = 5) {
  return db.query.articles.findMany({
    where: eq(articles.status, "published"),
    orderBy: [desc(articles.views)],
    limit,
    with: { images: { orderBy: [asc(articleImages.displayOrder)] } },
  })
}

export async function getRelatedArticles(category: string, excludeId: string, limit = 3) {
  const byCategory = await db.query.articles.findMany({
    where: and(
      eq(articles.status, "published"),
      sql`${articles.categories} @> ARRAY[${category}]::text[]`
    ),
    orderBy: [desc(articles.publishedAt)],
    limit: limit + 5,
    with: { images: { orderBy: [asc(articleImages.displayOrder)] } },
  })
  const filtered = byCategory.filter((a) => a.id !== excludeId).slice(0, limit)
  if (filtered.length >= limit) return filtered
  const extra = await db.query.articles.findMany({
    where: eq(articles.status, "published"),
    orderBy: [desc(articles.publishedAt)],
    limit: limit + 5,
    with: { images: { orderBy: [asc(articleImages.displayOrder)] } },
  })
  const used = new Set([excludeId, ...filtered.map((a) => a.id)])
  return [...filtered, ...extra.filter((a) => !used.has(a.id)).slice(0, limit - filtered.length)]
}

export async function getAllArticlesAdmin() {
  return db.query.articles.findMany({
    orderBy: [asc(articles.displayOrder), desc(articles.publishedAt)],
    with: { images: { orderBy: [asc(articleImages.displayOrder)] } },
  })
}

export async function getDashboardStats() {
  const all = await db.select({ status: articles.status, views: articles.views }).from(articles)
  const total = all.length
  const published = all.filter((a) => a.status === "published").length
  const drafts = all.filter((a) => a.status === "draft").length
  const archived = all.filter((a) => a.status === "archived").length
  const totalViews = all.reduce((sum, a) => sum + a.views, 0)
  return { total, published, drafts, archived, totalViews }
}
