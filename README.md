# La Colonia Digital

Periódico digital con panel de administración. Construido con **Next.js 16**, **Neon Postgres**, **Vercel Blob** y **TipTap**.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions) |
| Base de datos | Neon Postgres + Drizzle ORM |
| Storage de imágenes | Vercel Blob |
| Autenticación | JWT con jose (sesión en cookie HttpOnly) |
| Editor | TipTap |
| Reordenamiento | @dnd-kit |
| Estilos | Tailwind CSS v4 + shadcn/ui |

## Setup local

### 1. Clonar e instalar

```bash
git clone https://github.com/RafaelBrake1/la-colonia-digital.git
cd la-colonia-digital
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
# Edita .env.local con tus valores
```

### 3. Crear la base de datos en Neon

En Vercel → Storage → Create → Neon, o en neon.tech directamente.
Copia el connection string en DATABASE_URL de .env.local.
Pega el contenido de `drizzle/schema.sql` en la consola SQL de Neon.

### 4. Crear el usuario admin

```bash
DATABASE_URL="postgresql://..." node scripts/create-admin.mjs
```

### 5. Generar SESSION_SECRET

```bash
openssl rand -base64 32
# Pega el resultado en SESSION_SECRET de .env.local
```

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

- Sitio público: http://localhost:3000
- Panel admin: http://localhost:3000/admin/login

---

## Deploy en Vercel

1. **Importar repo** en vercel.com → New Project → la-colonia-digital
2. **Neon Postgres**: Storage → Create → Neon → ejecuta `drizzle/schema.sql`
3. **Vercel Blob**: Storage → Create → Blob (variables se agregan automáticamente)
4. **Variables de entorno** en Settings → Environment Variables:
   - `SESSION_SECRET` (genera con `openssl rand -base64 32`)
   - `NEXT_PUBLIC_APP_URL` (tu dominio, ej: https://la-colonia-digital.vercel.app)
5. **Usuario admin en producción**: `DATABASE_URL="prod-url" node scripts/create-admin.mjs`
6. Re-deploy automático en cada push a `main`

---

## Funcionalidades del panel admin

- **Crear / Editar**: Editor TipTap (H2, H3, negrita, cursiva, listas, citas, enlaces)
- **Imágenes**: Sube a Vercel Blob o pega URL. Posición (arriba, centro, abajo, izquierda, derecha, ancho-completo) y tamaño configurables
- **Estados**: Publicado / Borrador / Archivado
- **Destacado**: Una noticia aparece en el hero principal del inicio
- **Reordenar**: Drag-and-drop en publicadas para cambiar el orden del sitio
- **Archivar / Restaurar**: Archivadas no aparecen en el sitio, restaurables como borrador
- **Eliminar**: Con confirmación

---

Co-Authored-By: Oz <oz-agent@warp.dev>
