# Photographer Portfolio — Fullstack Platform

This repository contains the complete portfolio platform for a photographer, consisting of:
1. **Backend API** (Node.js, Express, TypeScript, Prisma, Supabase PostgreSQL, Cloudinary)
2. **Admin Panel** (React, Vite, Tailwind CSS, TanStack Query, Zustand, @dnd-kit)
3. **Public Website** (Next.js 15 App Router, Tailwind CSS, TanStack Query, Infinite Scroll, Lightbox, SEO)

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM, Supabase (PostgreSQL), Cloudinary (Image storage & optimization via `sharp`), JWT (httpOnly cookies for Access & Refresh tokens)
- **Admin Panel:** React (Vite), TypeScript, Tailwind CSS (White/Slate theme), TanStack Query v5, Zustand, React Hook Form, Zod, `@dnd-kit` (drag & drop reordering)
- **Public Website:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, TanStack Query v5, Native CSS Scroll-driven animations (`animation-timeline: view()`) with IntersectionObserver fallback, Infinite Scroll with cursor pagination, Lightbox modal, Dynamic SEO metadata & sitemaps.

---

## 📁 Project Structure

```
photo-portfolio/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema definition
│   │   └── seed.ts             # Admin account seeding script
│   ├── src/
│   │   ├── config/             # Environment, Prisma client, Cloudinary
│   │   ├── middlewares/        # Authentication, Error handling, Multer upload
│   │   ├── modules/
│   │   │   ├── auth/           # Login, Refresh, Logout, Me endpoints
│   │   │   ├── business/       # Business info singleton CRUD
│   │   │   ├── categories/     # Category CRUD & order management
│   │   │   ├── albums/         # Paginated album collections & slug lookups
│   │   │   └── images/         # Multi-image upload, slider toggle, cursor pagination
│   │   ├── utils/              # JWT tokens, Cloudinary WebP conversion, Slugs
│   │   ├── app.ts              # Express application configuration
│   │   └── server.ts           # Server bootstrap
│   └── package.json
│
├── admin/
│   ├── src/
│   │   ├── api/                # Axios instance with silent refresh interceptor
│   │   ├── components/
│   │   │   ├── layout/         # AdminLayout, Sidebar
│   │   │   ├── shared/         # ImageUploadZone, ThumbnailPicker, SortableImageGrid
│   │   │   └── ui/             # Button, Input, Modal, ConfirmDialog, LazyImage, Pagination
│   │   ├── pages/              # Login, Dashboard, Business, Categories, Albums, CreateAlbum, AlbumDetail
│   │   ├── stores/             # Zustand auth state
│   │   ├── hooks/              # useAuth hook
│   │   ├── router/             # ProtectedRoute guard & React Router setup
│   │   └── main.tsx
│   └── package.json
│
└── website/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx      # Root layout + QueryProvider + Navbar + Footer
    │   │   ├── page.tsx        # Home page (Hero, Slider, Categories, Featured, Contact)
    │   │   ├── category/[slug] # Category page with infinite scroll albums grid
    │   │   ├── album/[slug]    # Album page with infinite scroll photos & Lightbox
    │   │   ├── sitemap.ts      # Dynamic XML sitemap generator
    │   │   ├── robots.ts       # Robots.txt generator
    │   │   └── globals.css     # Tailwind v4, scroll-driven animations, marquee
    │   ├── components/
    │   │   ├── Navbar.tsx      # Clean sticky navbar with mobile drawer
    │   │   ├── Footer.tsx      # Footer with business info & fallbacks
    │   │   ├── LazyImage.tsx   # Blur-up lazy loading with shimmer skeletons
    │   │   ├── ScrollReveal.tsx# Viewport scroll animations (scale 0.88 -> 1)
    │   │   ├── WhatsAppButton.tsx # WhatsApp direct contact CTA
    │   │   ├── home/           # HeroSection, ImageSlider, CategoriesSection, FeaturedAlbums, ContactSection
    │   │   └── album/          # ImageGrid, Lightbox modal
    │   ├── lib/
    │   │   ├── api.ts          # Typed API client
    │   │   ├── query-keys.ts   # TanStack Query keys
    │   │   └── fallbacks.ts    # Fallback values for business info and slider images
    │   └── providers/
    │       └── QueryProvider.tsx # TanStack Query client with 5min cache
    └── package.json
```

---

## 🚀 Quick Start (Run Everything)

At the root directory:
```bash
# Install all dependencies across backend, admin, and website
npm run install:all

# Run backend, admin, and website concurrently
npm run dev
```

- **Backend API:** `http://localhost:4000`
- **Admin Panel:** `http://localhost:5173`
- **Public Website:** `http://localhost:3000`

---

## 🔧 Individual Services Setup

### 1. Backend Setup
1. `cd backend && npm install`
2. Create `.env` from `.env.example`:
   ```env
   PORT=4000
   NODE_ENV=development
   DATABASE_URL="your-supabase-transaction-pooler-url"
   DIRECT_URL="your-supabase-direct-url"
   ACCESS_TOKEN_SECRET="your-super-secret-access-token-key-min-32-chars"
   REFRESH_TOKEN_SECRET="your-super-secret-refresh-token-key-min-32-chars"
   CLOUDINARY_CLOUD_NAME="your_cloud_name"
   CLOUDINARY_API_KEY="your_api_key"
   CLOUDINARY_API_SECRET="your_api_secret"
   ADMIN_ORIGIN="http://localhost:5173"
   WEBSITE_ORIGIN="http://localhost:3000"
   SEED_ADMIN_EMAIL="admin@example.com"
   SEED_ADMIN_PASSWORD="ChangeMe123!"
   ```
3. `npx prisma db push`
4. `npm run db:seed`
5. `npm run dev`

### 2. Admin Panel Setup
1. `cd admin && npm install`
2. `npm run dev` (runs on `http://localhost:5173`)

### 3. Public Website Setup
1. `cd website && npm install`
2. Create `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```
3. `npm run dev` (runs on `http://localhost:3000`)
4. Build for production: `npm run build`

---

## 🌟 Public Website Features

- **White/Clean Minimalist Aesthetic:** Light palette focused on letting photographs shine.
- **Performant Viewport Scroll Animations:** Native CSS scroll-driven animations (`animation-timeline: view()`) with IntersectionObserver fallback. Animates `transform: scale(0.88 -> 1.0)` and `opacity` on the GPU compositor thread without JS overhead.
- **Infinite Image Slider:** Marquee carousel on the homepage displaying highlighted photos (`showInSlider: true`), automatically falling back to high-resolution photography placeholders if fewer than 5 photos are marked.
- **Cursor-Based Infinite Scroll:** Fast, non-duplicated paginated loading for category album lists and album photo galleries.
- **Full-Screen Lightbox:** Native modal dialog with keyboard navigation (Arrow keys, Esc), smooth slide switching, and photo count indicators.
- **SEO & Social Share Ready:** Dynamic page metadata, Open Graph cards, sitemap (`/sitemap.xml`), and robots rules (`/robots.txt`).
- **Resilient Fallbacks:** In case the database or business info is not yet populated, sensible fallbacks are automatically provided for phone, address, WhatsApp, and showcase images.
