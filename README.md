# ⛽ FuelSync-AI — Smart CNG Pump Finder & Optimizer

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green.svg)](https://fastapi.tiangolo.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

FuelSync-AI is a production-ready backend system for finding and optimizing CNG (Compressed Natural Gas) pump usage using real-time crowd intelligence, AI-powered recommendations, and predictive ML models.

## ✨ Features

- 🔍 **Real-time pump discovery** with crowd level tracking (0–100%)
- 🤖 **AI-powered recommendations** using a smart 100-point scoring algorithm
- ⚡ **WebSocket live updates** for real-time crowd level changes
- 💰 **Price tracking** with CNG vs Petrol vs Diesel comparison
- 🔔 **Smart alerts** — get notified when your preferred pump has low crowd
- 💬 **Claude AI chatbot** for CNG-related assistance
- 📊 **ML models** for congestion prediction, queue estimation, and demand forecasting
- 🔐 **JWT authentication** with refresh tokens
- 🐳 **Docker-ready** with multi-stage builds

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI (Python 3.11) |
| Database | PostgreSQL 15 |
| ORM | SQLAlchemy 2.0 |
| Validation | Pydantic v2 |
| Auth | JWT (python-jose) + bcrypt |
| Real-time | WebSockets |
| AI | Claude (Anthropic API) |
| Cache | Redis |
| Testing | pytest + httpx |
| Docker | Multi-stage Dockerfile |

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- PostgreSQL 15
- Redis (optional)

### Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-org/FuelSync-AI.git
cd FuelSync-AI

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r backend/requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

# 5. Initialize database
python scripts/init_db.py

# 6. Seed sample data (Mumbai, Delhi, Pune pumps)
python scripts/seed_data.py

# 7. Start the server
PYTHONPATH=. uvicorn backend.app:app --reload --port 8000
```

Access:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Frontend**: Open `frontend/index.html` in your browser

### Docker Setup

```bash
# Copy and configure environment
cp .env.example .env

# Build and start all services
docker compose -f docker/docker-compose.yml up --build -d

# Initialize database (first time)
docker exec fuelsync_api python scripts/init_db.py
docker exec fuelsync_api python scripts/seed_data.py
```

## ⚙️ Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SECRET_KEY` | ✅ | JWT signing secret (use a strong random key) |
| `ANTHROPIC_API_KEY` | ⬜ | Claude AI key (chat falls back to rule-based) |
| `GOOGLE_MAPS_API_KEY` | ⬜ | Maps key (frontend map placeholder if absent) |
| `REDIS_URL` | ⬜ | Redis URL for optional caching |
| `CORS_ORIGINS` | ⬜ | JSON array of allowed origins |
| `DEBUG` | ⬜ | Enable debug mode (default: false) |

## 📡 API Overview

### Authentication
```
POST /api/auth/register     — Register new user
POST /api/auth/login        — Login, returns JWT
POST /api/auth/refresh      — Refresh access token
GET  /api/auth/me           — Get current user
```

### CNG Pumps
```
GET  /api/pumps/            — List pumps (city, area, status filters)
GET  /api/pumps/nearby      — Pumps near coordinates (lat, lng, radius)
GET  /api/pumps/{id}        — Get pump details
POST /api/pumps/            — Create pump (admin)
GET  /api/pumps/{id}/reviews — Get reviews
POST /api/pumps/{id}/reviews — Submit review (auth required)
```

### Recommendations
```
POST /api/recommendations/       — Get ranked recommendations
GET  /api/recommendations/best-pick — Best pump right now
GET  /api/recommendations/trending  — Trending pumps
```

### Prices
```
GET /api/prices/today           — Today's prices all cities
GET /api/prices/city/{city}     — Price for specific city
GET /api/prices/comparison      — CNG vs Petrol vs Diesel
GET /api/prices/history/{city}  — Historical price data
```

### Alerts & Chat
```
POST /api/alerts/               — Create crowd alert
GET  /api/alerts/notifications  — Get triggered alerts
POST /api/chat/message          — Chat with AI assistant
```

### WebSocket
```
WS /ws/pumps/live   — Live pump crowd updates (every 30s)
WS /ws/alerts       — Real-time alert notifications
```

## 🧪 Running Tests

```bash
PYTHONPATH=. pytest backend/tests/ -v --tb=short
```

## 📁 Project Structure

```
FuelSync-AI/
├── backend/          # FastAPI application
│   ├── app.py        # Application entry point
│   ├── config.py     # Settings (Pydantic BaseSettings)
│   ├── auth/         # JWT + decorators
│   ├── models/       # SQLAlchemy ORM models
│   ├── routes/       # API route handlers
│   ├── services/     # Business logic layer
│   ├── utils/        # Validators, helpers
│   └── tests/        # pytest test suite
├── ml_models/        # Prediction & forecasting models
├── frontend/         # Dark-themed HTML/CSS/JS dashboard
├── docker/           # Dockerfile + docker-compose
├── scripts/          # DB init, seed, migrations
└── docs/             # API, Architecture, Deployment docs
```

## 🤖 ML Models

| Model | Purpose |
|-------|---------|
| `CongestionPredictor` | Predict crowd level by hour & day |
| `QueuePredictor` | Estimate wait time in minutes |
| `TrafficAnalyzer` | Route time with traffic factor |
| `DemandForecaster` | 24-hour demand forecast |

## 📖 Documentation

- [API Reference](docs/API.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
