-- Migración: cambiar category (TEXT) → categories (TEXT[])
-- Ejecutar en Neon SQL Editor si ya tienes artículos en la base de datos.
-- Si la tabla está vacía, puedes ignorar este archivo y usar schema.sql directamente.

-- Paso 1: Agregar la nueva columna
ALTER TABLE articles
  ADD COLUMN IF NOT EXISTS categories TEXT[] NOT NULL DEFAULT '{}';

-- Paso 2: Migrar datos existentes (mover category → categories)
UPDATE articles
SET categories = ARRAY[category]
WHERE array_length(categories, 1) IS NULL OR array_length(categories, 1) = 0;

-- Paso 3: Eliminar la columna antigua
ALTER TABLE articles
  DROP COLUMN IF EXISTS category;
