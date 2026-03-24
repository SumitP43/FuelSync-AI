# FuelSync AI – System Architecture

## Overview

FuelSync AI is a microservices-based application with three primary services:

```
[User Browser]
     │
     ▼
[Frontend: Next.js :3000]
     │
     ├──► [Backend API: Express :5000]
     │         │
     │         ├──► [MongoDB :27017]
     │         │         ├── pumps
     │         │         ├── users
     │         │         ├── feedback
     │         │         ├── crowd_reports
     │         │         └── predictions
     │         │
     │         └──► [ML Service: Flask :5001]
     │                   └── Linear Regression Model
     │
     └──► [OpenStreetMap Tiles] (no API key)
```

## Component Breakdown

### 1. Frontend (Next.js)

**Responsibilities:**
- Render interactive map with pump markers
- Handle geolocation (GPS)
- Voice command input/output (Web Speech API)
- Display prediction graphs (Recharts)
- Manage crowd reports and feedback forms
- Filter/search pumps

**Key Patterns:**
- Custom React hooks for data fetching (`usePumps`, `useRecommendations`, etc.)
- Dynamic imports for browser-only components (Leaflet map)
- Axios interceptors for auth token injection

### 2. Backend API (Express)

**Responsibilities:**
- REST API gateway
- Business logic for recommendations
- MongoDB data access
- JWT auth middleware
- Rate limiting & security headers

**Recommendation Algorithm:**
```
For each nearby pump:
  1. Get current crowd level (from recent crowd report or default)
  2. Call ML service for predicted wait time
  3. Compute score:
     distScore  = 1 - (pump.distance / maxDist)
     waitScore  = 1 - (pump.predictedWait / maxWait)
     ratingScore = pump.averageRating / 5
     finalScore = 0.3*distScore + 0.5*waitScore + 0.2*ratingScore
  4. Sort by finalScore DESC
  5. Return top N pumps with reasons
```

**Geolocation:**
- Haversine formula for accurate distance calculation
- All pumps fetched from DB then filtered in-memory (efficient for < 1000 pumps)
- For production scale: Use MongoDB `$geoNear` aggregation

### 3. ML Service (Flask)

**Model Architecture:**
- Algorithm: Linear Regression
- Features: `[hour, day_of_week, historical_avg_wait, crowd_level]`
- Target: `wait_time` (minutes)
- Preprocessing: StandardScaler normalization
- Training data: CSV + synthetic augmentation
- Model persistence: joblib `.pkl` files

**Prediction Pipeline:**
```
Input → Validate → Scale → Predict → Confidence → Return
```

**Fallback Strategy:**
If ML service is unavailable, backend uses heuristic calculation:
```
multiplier = 1.8 during morning peak (6-9 AM)
multiplier = 2.0 during evening peak (5-7 PM)
multiplier = 1.4 during lunch (12-1 PM)
wait_time = historical_avg × multiplier × weekday_factor
```

### 4. Database (MongoDB)

**Collections:**
- `pumps` – Static pump data + dynamic ratings/crowd
- `users` – Auth + preferences + favorites
- `feedback` – Star ratings + reviews
- `crowd_reports` – TTL index (expires after 2h)
- `predictions` – Audit log of predictions vs actuals

**Indexes:**
- `pumps`: `{ latitude: 1, longitude: 1 }`
- `crowd_reports`: `{ expires_at: 1 }` (TTL), `{ pump_id: 1, timestamp: -1 }`
- `predictions`: `{ pump_id: 1, hour: 1 }`

## Data Flow

### User Opens App
```
1. Browser requests GPS location
2. useLocation hook gets lat/lng
3. usePumps calls GET /api/pumps/nearby?lat=X&lng=Y
4. Backend fetches pumps from MongoDB
5. Haversine filter applied
6. CrowdReport enrichment (latest report per pump)
7. Pumps returned with distance + crowd level
8. Map renders markers, list renders cards
```

### AI Recommendation Request
```
1. useRecommendations calls GET /api/recommendations
2. Backend fetches nearby pumps
3. For each pump: calls ML service /predict
4. ML service returns predicted_wait + confidence
5. Scores computed and ranked
6. Top 5 recommendations returned with reasons
```

### Crowd Report Submission
```
1. User taps "Report Crowd" on pump
2. Selects level (1-5) and optional wait time
3. POST /api/crowd-report
4. CrowdReport created with 2h TTL
5. Pump.current_crowd_level updated
6. Next ML prediction uses new crowd level
```

## Security

| Layer | Measure |
|-------|---------|
| Network | CORS with allowed origins |
| Headers | Helmet.js (CSP, XSS, etc.) |
| Auth | JWT HS256, 7-day expiry |
| Rate Limit | 100 req/15min (global), 20/15min (auth) |
| Input | Express-validator, size limits (10kb) |
| ML | Train endpoint protected by API key |

## Scalability Considerations

- **Horizontal**: Backend is stateless – add instances behind a load balancer
- **Caching**: Prediction results can be Redis-cached (TTL ~1h)
- **DB**: MongoDB Atlas with replica sets for HA
- **ML**: Flask can be replaced with FastAPI + async for higher throughput
- **Maps**: Current Leaflet + OSM is free; swap to Google Maps for enterprise

## Deployment

Single command with Docker Compose:
```bash
docker-compose up --build
```

Services start in dependency order:
1. MongoDB (health-checked)
2. ML Service (trains model on first start)
3. Backend (seeds data)
4. Frontend (builds Next.js)
