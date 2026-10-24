# Sonic Fitness Core (HUD & Progression Engine)

An arcade-inspired fitness tracker combining RPG character progression, 5-Ring mastery thresholds, and Sonic-style Stage Clear scoring with joint-shield safety mechanics.

## Architecture

```
sonic-fitness-core/
├── backend/
│   ├── app.py           # FastAPI REST API (stage evaluation, scoring, telemetry)
│   ├── models.py        # Domain data models & Stage Clear scoring engine
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── index.html       # Mobile-first cockpit PWA (large tap zones, wake lock, haptics)
│   ├── manifest.json    # Progressive Web App manifest (standalone, theme colors)
│   └── sw.js            # Offline service worker (cache-first static, network-first API)
├── .gitignore
└── README.md
```

## Quickstart

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Launch
You can serve the `frontend/` directory using any static file server:
```bash
cd frontend
python -m http.server 3000
```
Open `http://<your-lan-ip>:3000` on your phone, then tap **"Add to Home Screen"** to install the full-screen PWA.
