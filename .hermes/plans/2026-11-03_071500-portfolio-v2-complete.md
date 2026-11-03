# Plan: Complete portfolio-v2 into a full portfolio site (Detailed)

## Goal
Build out `ringga-dev/portfolio-v2` from its current minimal state into a complete, responsive portfolio website with zambrut (emerald) theme, covering all essential pages, components, and data.

## Current context / assumptions
- Repo path: `/mnt/ssd/project/portfolio-v2`
- GitHub: https://github.com/ringga-dev/portfolio-v2
- Stack: Nuxt 4 + Vue 3 + Tailwind CSS v3, static generation (SSG) for GitHub Pages
- Base URL: `/portfolio-v2/`
- Theme: zambrut (emerald green) — CSS vars in `src/assets/css/index.css`
- Currently has: `app.vue`, `pages/index.vue` (hero + 2 project cards), `nuxt.config.ts`, `tailwind.config.ts`, `package.json`, `deploy.yml`
- Missing: Navbar, Footer, About, Skills, Experience, Contact pages, project detail, data files
- Deploy: GitHub Actions → GitHub Pages (Node 22, `npm run generate`)

## Architecture
- File-based routing via `src/pages/`
- Components auto-imported from `src/components/`
- All content static (no API/backend)
- Data in `src/data/` as JSON
- Theme: "Kotlin Zambrut Glass" — glassmorphism (backdrop-blur, translucent surfaces, subtle borders) with emerald/zambrut accent colors
- Real images only (photos, screenshots) — no AI-generated assets
- Visual style: frosted glass cards, emerald glow accents, depth through blur and transparency

## Step-by-step tasks

### Task 0: Update CSS design system (Kotlin Zambrut Glass)
**File:** `src/assets/css/index.css`
Replace solid colors with glassmorphism-friendly variables:
- `--bg`: deep dark slate (not pure black)
- `--surface`: translucent white/emerald overlay
- `--glass`: rgba(255,255,255,0.05) for glass cards
- `--accent`: emerald-500 (#10b981)
- `--accent-glow`: emerald-400 for glow effects
- Backdrop blur on all card surfaces
- Subtle 1px borders with low opacity white

**File:** `src/data/profile.json`
```json
{
  "name": "Ringga Septia Pribadi",
  "title": "Multi-Platform Engineer",
  "bio": "I build mobile, web, and desktop applications with Kotlin and Vue. Specialized in Kotlin Multiplatform, Jetpack Compose, and system-level integrations.",
  "location": "Batam, Kepulauan Riau, Indonesia",
  "email": "contact@ringga.dev",
  "github": "https://github.com/ringga-dev",
  "linkedin": "https://linkedin.com/in/ringgadev"
}
```

**File:** `src/data/projects.json`
```json
{
  "projects": [
    {
      "slug": "system-monitor",
      "title": "System Monitor",
      "description": "Real-time server monitoring dashboard with Rust collector, Axum server, and Vue 3 frontend.",
      "tech": ["Rust", "Axum", "Vue 3", "SQLite", "uPlot"],
      "url": "https://github.com/ringga-dev/system-monitor-v2"
    },
    {
      "slug": "pancing-bot",
      "title": "Pancing Bot",
      "description": "Documentation site for AI account identification and detection methods.",
      "tech": ["MkDocs", "Python", "GitHub Actions"],
      "url": "https://github.com/ringga-dev/pancing-bot"
    },
    {
      "slug": "kmp-printer",
      "title": "KMP Printer",
      "description": "Open-source thermal printing library for Kotlin Multiplatform (ESC/POS).",
      "tech": ["Kotlin", "KMP", "ESC/POS"],
      "url": "https://github.com/ringga-dev/kmp-printer"
    }
  ]
}
```

**File:** `src/data/skills.json`
```json
{
  "skills": [
    { "name": "Kotlin", "level": 90 },
    { "name": "Vue / Nuxt", "level": 85 },
    { "name": "Rust", "level": 70 },
    { "name": "TypeScript", "level": 80 },
    { "name": "PostgreSQL", "level": 75 },
    { "name": "Docker", "level": 70 }
  ]
}
```

### Task 2: Create Navbar component
**File:** `src/components/Navbar.vue`
Sticky top nav with logo, links (Home, About, Projects, Skills, Contact).

### Task 3: Create Footer component
**File:** `src/components/Footer.vue`
Simple footer with copyright and social links.

### Task 4: Update app.vue
**File:** `src/app.vue`
Include Navbar + NuxtPage + Footer in flex column layout.

### Task 5: Update home page
**File:** `src/pages/index.vue`
- Hero section (name, title, bio, CTA buttons)
- Skills snippet (top 3)
- Featured projects (2 cards)
- CTA to contact

### Task 6: Create About page
**File:** `src/pages/about.vue`
- Bio section
- Skills with progress bars
- Experience timeline

### Task 7: Create Projects page
**File:** `src/pages/projects.vue`
- Grid of all project cards
- Each card: title, description, tech tags, link

### Task 8: Create Skills page
**File:** `src/pages/skills.vue`
- All skills with progress bars
- Categorized (Mobile, Web, Backend, DevOps)

### Task 9: Create Contact page
**File:** `src/pages/contact.vue`
- Contact info (email, GitHub, LinkedIn)
- Simple contact form (mailto)

### Task 10: Push and verify deploy
- Commit all changes
- Push to main
- Verify GitHub Actions deploy succeeds
- Check live URL returns 200

## Tests / validation
- `npm run generate` should complete without errors
- All pages accessible at their routes
- Live URL returns HTTP 200
- No console errors in browser

## Risks
- Node 20 local vs Node 22 CI — package compatibility
- Zambrut theme is very minimal; may need refinement based on user feedback
- No backend/API — all content is static JSON/MD
- GitHub Pages base URL must match `/portfolio-v2/`