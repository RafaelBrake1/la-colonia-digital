import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const articles = pgTable("articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  author: text("author").notNull(),
  status: text("status", {
    enum: ["published", "draft", "archived"],
  })
    .notNull()
    .default("draft"),
  isFeatured: boolean("is_featured").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  views: integer("views").notNull().default(0),
  publishedAt: timestamp("published_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const articleImages = pgTable("article_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  articleId: uuid("article_id")
    .notNull()
    .references(() => articles.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  alt: text("alt").notNull().default(""),
  caption: text("caption"),
  position: text("position", {
    enum: [
      "arriba",
      "centro",
      "abajo",
      "izquierda",
      "derecha",
      "ancho-completo",
    ],
  })
    .notNull()
    .default("centro"),
  size: text("size", { enum: ["pequena", "mediana", "grande", "completa"] })
    .notNull()
    .default("mediana"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// Relations
export const articlesRelations = relations(articles, ({ many }) => ({
  images: many(articleImages),
}))

export const articleImagesRelations = relations(articleImages, ({ one }) => ({
  article: one(articles, {
    fields: [articleImages.articleId],
    references: [articles.id],
  }),
}))

// Types
export type User = typeof users.$inferSelect
export type Article = typeof articles.$inferSelect & {
  images: ArticleImage[]
}
export type ArticleImage = typeof articleImages.$inferSelect
export type NewArticle = typeof articles.$inferInsert
export type NewArticleImage = typeof articleImages.$inferInsert
