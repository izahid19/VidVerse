# 🐍 VidVerse Backend — Flask API & Worker Pipeline

The VidVerse backend is a highly performant Flask Application Factory designed to extract media metadata and manage background download workers asynchronously.

---

## 🏗️ Folder Structure
```
backend/
├── app/
│   ├── core/
│   │   └── store.py          # Thread-safe in-memory store for downloads
│   ├── routes/
│   │   ├── download.py       # Download control and static file delivery
│   │   └── info.py           # Metadata extraction route
│   ├── services/
│   │   ├── downloader.py     # Background worker thread downloads (yt-dlp)
│   │   └── extractor.py      # Meta parser service
│   ├── utils/
│   │   ├── formatters.py     # View/Duration data format helpers
│   │   └── validators.py     # Platform-specific URL regex validators
│   └── __init__.py           # Application Factory creator
├── run.py                    # Dev server execution script
├── wsgi.py                   # Waitress WSGI production entry-point
└── requirements.txt          # Python dependencies
```

---

## ⚙️ Core Architecture Details

### 1. In-Memory Thread-Safe State Store
To support asynchronous polling without overhead databases, download sessions are keyed by `download_id` (UUID) inside `app/core/store.py`. Access is regulated via `threading.Lock` to support simultaneous read/write cycles between the background worker thread and Flask route threads.

### 2. Waitress Production WSGI (Windows Friendly)
For production environments (specifically Windows), standard servers like Gunicorn do not run natively. We integrate **Waitress** in `wsgi.py` configured with 8 concurrent worker threads, serving:
- `/api/*` requests mapped to Flask routes.
- Built React static assets directly from the `frontend/dist` directory.
- An SPA catch-all fallback directing all unknown routes to `index.html`.

---

## 🔧 Installation & Local Dev

1. Create a Python virtual environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows
   ```
2. Install requirements:
   ```bash
   pip install -r requirements.txt
   ```
3. Set environment configuration in `.env` (optional, defaults port to `3010`):
   ```env
   PORT=3010
   FLASK_ENV=development
   ```
4. Run dev server:
   ```bash
   python run.py
   ```
