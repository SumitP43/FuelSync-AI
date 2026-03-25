# ⛽ FuelSync AI – Smart CNG Pump Recommendation System

> **AI-powered real-time CNG pump finder with crowd predictions, voice commands, and smart routing.**  
> Hackathon-ready. Production-grade. One-command deploy.

![FuelSync AI Banner](https://img.shields.io/badge/FuelSync-AI%20Powered-22c55e?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PC9zdmc+)

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.11-blue)](https://python.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://mongodb.com)

---

## 🚨 Problem

Urban CNG users waste **20–30 minutes daily** in queues at fuel stations because:
- No real-time crowd visibility
- Nearest pump ≠ best pump
- No predictive tools for planning visits

## 💡 Solution

FuelSync AI puts an **AI assistant in your pocket** that:
1. Detects your live GPS location
2. Shows nearby CNG pumps on an interactive map
3. Predicts wait times using Machine Learning
4. Recommends the **optimal** pump (not just nearest)
5. Provides **hands-free voice commands** while driving

---

## 🏆 Hackathon-Winning Features

| Feature | Status |
|---------|--------|
| 🗺️ Interactive OpenStreetMap with real-time pump markers | ✅ |
| 🧠 AI wait-time predictions (Linear Regression) | ✅ |
| 🎤 Voice Assistant ("Find low crowd pump") | ✅ |
| 📊 24-hour prediction graph (Recharts) | ✅ |
| 🚦 Real-time crowd status indicators | ✅ |
| ⭐ User rating & review system | ✅ |
| 📱 Mobile-first responsive design | ✅ |
| 🔍 Advanced filters (crowd, search) | ✅ |
| 💬 Community crowd reporting | ✅ |
| 🐳 One-command Docker deployment | ✅ |
| 30+ CNG pumps across 10 Indian cities | ✅ |

---

## 🛠 Technology Stack

### Frontend
- **Next.js 14** + React 18
- **TailwindCSS** (dark-mode-first design)
- **Leaflet** (interactive maps, no API key needed)
- **Recharts** (prediction graphs)
- **Web Speech API** (voice commands)

### Backend
- **Node.js 18** + Express 4
- **MongoDB** + Mongoose 8
- **JWT** authentication
- **Helmet** + CORS + Rate limiting

### AI/ML
- **Python 3.11** + Scikit-learn
- **Linear Regression** for wait time prediction
- **Flask** REST API (< 100ms response)
- **joblib** model persistence

---

## ⚡ Quick Start

### Prerequisites
- [Docker](https://docker.com) & Docker Compose, OR
- Node.js 18+, Python 3.11+, MongoDB

### 🐳 Option A: Docker (Recommended)

```bash
# Clone the repo
git clone https://github.com/SumitP43/FuelSync-AI.git
cd FuelSync-AI

# Start everything (MongoDB + ML + Backend + Frontend)
docker-compose up --build

# App available at:
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
# ML Service: http://localhost:5001
```

### 🔧 Option B: Manual Setup

**1. ML Model**
```bash
cd ml_model
pip install -r requirements.txt
python train.py        # Train the model
python app.py          # Start Flask on port 5001
```

**2. Backend**
```bash
cd backend
cp .env.example .env   # Edit with your values
npm install
npm run seed           # Seed 30+ pumps to MongoDB
npm run dev            # Start on port 5000
```

**3. Frontend**
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev            # Start on port 3000
```

---

## 📡 API Reference

### Pumps
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/pumps/nearby?lat=X&lng=Y&radius=10` | Get nearby pumps |
| `GET` | `/api/pumps/:id` | Get pump details |
| `GET` | `/api/pumps?city=Delhi` | List all pumps |

### Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/predictions/:pumpId?hour=8` | Get prediction for specific hour |
| `GET` | `/api/prediction-graph/graph/:pumpId` | 24-hour graph data |

### Recommendations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/recommendations?lat=X&lng=Y` | AI-ranked pump recommendations |

### Community
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/crowd-report` | Submit crowd report |
| `POST` | `/api/feedback` | Submit rating & review |
| `GET` | `/api/feedback/:pumpId` | Get pump reviews |

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register user |
| `POST` | `/api/auth/login` | Login |
| `GET` | `/api/auth/me` | Current user |

### ML Service
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predict` | Predict wait time |
| `GET` | `/predict/graph/:pumpId` | 24h graph prediction |
| `POST` | `/predict/batch` | Batch predictions |
| `GET` | `/health` | ML service health |

---

## 🧠 AI Model

### Algorithm

**Wait Time Prediction:**
```
Features: [hour, day_of_week, historical_avg_wait, crowd_level]
Model: Linear Regression (Scikit-learn)
Training: 1000+ synthetic + historical records
Response: < 100ms
```

**Smart Recommendation Scoring:**
```
Score = (0.3 × distance_score) + (0.5 × wait_time_score) + (0.2 × rating_score)
```
All scores normalized 0–1. Pumps ranked by descending score.

### Features
- **Hour of day** – captures peak hours (7-9 AM, 5-7 PM)
- **Day of week** – weekdays busier than weekends
- **Historical avg wait** – pump-specific baseline
- **Crowd level** – real-time community reports (1-5 scale)

---

## 📂 Project Structure

```
FuelSync-AI/
├── frontend/                 # Next.js 14 + TailwindCSS
│   └── src/
│       ├── pages/           # Next.js pages
│       ├── components/      # React components
│       ├── hooks/           # Custom hooks
│       ├── services/        # API client
│       └── utils/           # Helpers & constants
├── backend/                 # Node.js + Express + MongoDB
│   └── src/
│       ├── routes/          # API routes
│       ├── controllers/     # Business logic
│       ├── models/          # Mongoose schemas
│       ├── middleware/      # Auth, errors, rate-limit
│       └── utils/           # Geo, ML client, cache
├── ml_model/                # Python + Flask + Scikit-learn
│   ├── app.py              # Flask API
│   ├── train.py            # Model training
│   ├── predict.py          # Prediction logic
│   └── data/               # Training data
├── docker-compose.yml
├── README.md
└── ARCHITECTURE.md
```

---

## 🌍 Sample Data

- **31 CNG pumps** across Delhi, Mumbai, Bangalore, Hyderabad, Pune, Ahmedabad, Chennai, Jaipur, Lucknow, Surat
- Historical wait time patterns for all hours
- Demo user: `demo@fuelsync.ai` / `demo1234`

---

## 🔒 Security

- JWT authentication with configurable expiry
- Helmet.js security headers
- Rate limiting (100 req/15 min)
- Input validation & sanitization
- CORS with configurable origin

---

## 🚀 Future Roadmap

- [ ] Real IoT sensor integration at pumps
- [ ] EV charging station support
- [ ] Traffic API integration (Google Maps)
- [ ] Weather impact on predictions
- [ ] Push notifications for low-crowd alerts
- [ ] Mobile app (React Native)
- [ ] Government partnership for real CNG data

---

## 🏅 Built For Hackathon

> **"The best pump is the one that saves your time, not just the one that's closest."**

FuelSync AI combines ML predictions + community data + smart scoring to solve a real, daily urban problem. Ready to demo, ready to scale.

---

## 👥 Contributors

| Name | Role |
|------|------|
| [Sumit](https://github.com/SumitP43) | Project Lead |
| Krish | Contributor |

---

## 📄 License

MIT © 2024 FuelSync AI Team
