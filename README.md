# 🌌 VidVerse — Open Source Media Extraction Suite

VidVerse is a premium, open-source web application designed for extracting and downloading high-resolution videos, shorts, reels, and audio tracks from YouTube, YouTube Shorts, Instagram, and Twitter (X) with absolute precision. 

Built using a highly optimized Flask Application Factory on the backend and a modular React SPA with smooth GSAP animations on the frontend.

---

## 🚀 Key Features
- **YouTube Downloader:** Video resolution extraction (up to 4K/1080p/720p/etc.) and high-fidelity MP3 conversions (320k, 192k, 128k bitrates).
- **YouTube Shorts Downloader:** Custom portrait layout designed specifically for Shorts video extraction.
- **Instagram Downloader:** Seamless extraction of Instagram Reels, video posts, and IGTV links.
- **Twitter (X) Downloader:** Video extraction from Twitter status posts at all available qualities.
- **Thumbnail Downloader:** Centralized proxy service to safely download high-resolution video covers bypassing browser CORS.
- **Centralised SEO Management:** Dynamic header updates for all pages.
- **Modular Component Tree:** Thin route templates separated into reusable card blocks, global toasts, and layout containers.

---

## 🛠️ Architecture & Tech Stack

### Root Layout
```
VideVerse/
├── backend/                  # Flask API & Downloader Service
├── frontend/                 # React (Vite) Single Page Application
├── DESIGN.md                 # Design specs (ignored)
└── README.md                 # Main Documentation
```

### Stack
- **Frontend:** React, Vite, GSAP, TailwindCSS, React-Router-DOM, React-Toastify
- **Backend:** Flask, Waitress WSGI (8 threads, Windows compatible), yt-dlp, FFmpeg
- **Extraction Engine:** Threaded asynchronous downloader pipeline with polling status queries

---

## ⚡ Quick Start

### Running in Production (Single Command)
1. Build the React frontend:
   ```bash
   cd frontend
   npm run build
   ```
2. Start the Waitress server on the backend:
   ```bash
   cd ../backend
   python wsgi.py
   ```
3. Visit: `http://localhost:3010` (Waitress serves both the Flask API and compiled SPA statically).

### Running in Development (Concurrent Servers)
- **Backend Dev Server (Port 3010):**
  ```bash
  cd backend
  python run.py
  ```
- **Frontend Dev Server (Port 5173 with API Proxying):**
  ```bash
  cd frontend
  npm run dev
  ```
