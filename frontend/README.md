# ⚛️ VidVerse Frontend — React SPA (Vite)

A premium, fluid, and responsive single-page web interface for extracting and downloading media. Follows modular React Best Practices.

---

## 🎨 Design System & Aesthetics
- **Liquid Glass Container Layouts:** Premium transparency panels with ambient colored glow overlays matching the branding of the targeted platform.
- **GSAP Stagger Animations:** Micro-reveal transitions and interactive springy physics on cards.
- **Brand Theming:** Dedicated colors for YouTube (Red), YT Shorts (Bright Red), Instagram (Orange-to-Purple gradient), and Twitter/X (Sky Blue/Dark).

---

## 🏗️ Folder Structure
```
frontend/src/
├── components/
│   ├── ui/                   # Shadcn base primitives (Button, Input, Progress)
│   ├── home/                 # Home page specific segments (Hero, PlatformGrid)
│   ├── DownloadForm.jsx      # Generic URL validation and search input
│   ├── Footer.jsx            # Detailed resource/platform footer
│   ├── Navbar.jsx            # Navbar header logo link
│   └── SEO.jsx               # Header meta tags and title injector
├── config/
│   ├── config.js             # API base address settings
│   └── seo.config.js         # Page metadata strings
├── containers/
│   └── AppShell.jsx          # Sticky Header/Footer layout page wrapper
├── crud/
│   └── youtube.crud.js       # Centralised API fetch hooks (CORS safe)
├── pages/
│   ├── Home.jsx              # Landing page
│   ├── Instagram.jsx         # Instagram Downloader
│   ├── Twitter.jsx           # Twitter / X Downloader
│   ├── Youtube.jsx           # YouTube video downloader
│   ├── YoutubeShorts.jsx     # YT Shorts downloader
│   └── NotFound.jsx          # Custom animated 404 handler
├── reusable/
│   ├── Icons.jsx             # SVG custom inline icon exports
│   ├── InstagramCard.jsx     # Portrait Instagram post card
│   ├── ShortsCard.jsx        # Portrait Shorts video card
│   ├── TwitterCard.jsx       # Standard landscape X video card
│   └── VideoCard.jsx         # Custom YT Video & Thumbnail Card
├── routes/
│   └── AppRoutes.jsx         # Lazy-loaded router matching AppShell
├── services/
│   └── toastMessages.js      # Global notifications registry
├── themes/
│   └── Theme.js              # Centralised layout style tokens
├── Utils/
│   └── helpers.js            # Validation and data string formatting
├── App.jsx                   # Global Toast mounting and AppRoutes wrapper
└── main.jsx                  # Main SPA launcher
```

---

## 🚀 Execution & Production Build

### Dependencies
- React (Hooks, lazy-loading)
- React Router DOM
- GSAP & `@gsap/react`
- React Toastify
- Tailwind CSS

### Commands
- Run development server (Vite HMR):
  ```bash
  npm run dev
  ```
- Build production assets:
  ```bash
  npm run build
  ```
  *(Outputs static client bundles into `dist/` directory).*
