-- ============================================================
-- La Colonia Digital — Schema inicial
-- Ejecutar en: Neon Postgres (vía Vercel Integration)
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Usuarios (solo admin)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Artículos
CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('published', 'draft', 'archived')),
  is_featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Imágenes de artículos
CREATE TABLE IF NOT EXISTS article_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  caption TEXT,
  position TEXT NOT NULL DEFAULT 'centro'
    CHECK (position IN ('arriba', 'centro', 'abajo', 'izquierda', 'derecha', 'ancho-completo')),
  size TEXT NOT NULL DEFAULT 'mediana'
    CHECK (size IN ('pequena', 'mediana', 'grande', 'completa')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_articles_status_published ON articles(status, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_views ON articles(views DESC);
CREATE INDEX IF NOT EXISTS idx_articles_display_order ON articles(display_order);
CREATE INDEX IF NOT EXISTS idx_article_images_article ON article_images(article_id, display_order);

-- ============================================================
-- SEED: Crear usuario admin
-- Reemplaza 'tu@email.com', 'Tu Nombre' y el hash de contraseña.
--
-- Para generar el hash de la contraseña en Node.js:
--   node -e "const b=require('bcryptjs');b.hash('TuContraseña',12).then(console.log)"
--
-- Luego ejecuta:
-- ============================================================
-- INSERT INTO users (email, password_hash, name)
-- VALUES (
--   'admin@lacoloniadigital.com',
--   '$2a$12$XXXXXX...',   -- hash generado arriba
--   'Admin'
-- )
-- ON CONFLICT (email) DO NOTHING;
