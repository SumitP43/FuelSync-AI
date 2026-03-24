# FuelSync-AI System Architecture

## Overview

FuelSync-AI follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Client Layer                          │
│  Browser SPA (HTML/CSS/JS)  │  Mobile App  │  3rd Party │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/WebSocket
┌──────────────────────▼──────────────────────────────────┐
│                   API Gateway (FastAPI)                   │
│  CORS  │  JWT Auth Middleware  │  Rate Limiting           │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────────┐
        ▼              ▼                  ▼
┌───────────┐  ┌───────────────┐  ┌──────────────┐
│  Routes   │  │  WebSocket    │  │   Admin API  │
│  /api/... │  │  /ws/...      │  │  /api/admin  │
└─────┬─────┘  └───────┬───────┘  └──────┬───────┘
      │                │                  │
┌─────▼────────────────▼──────────────────▼───────┐
│                  Service Layer                    │
│  PumpService │ RecommendationEngine │ PriceService│
│  AlertService │ NotificationService │ ChatService │
└─────────────────────┬───────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
┌────────────┐  ┌─────────────┐  ┌──────────┐
│ ML Models  │  │  SQLAlchemy │  │ External │
│            │  │     ORM     │  │   APIs   │
└────────────┘  └──────┬──────┘  └──────────┘
                        │
              ┌─────────┼──────────┐
              ▼         ▼          ▼
         ┌─────────┐ ┌───────┐ ┌───────┐
         │PostgreSQL│ │ Redis │ │Claude │
         └─────────┘ └───────┘ └───────┘
```

## Component Details

### API Layer (FastAPI)
- **Routes**: Thin handlers that validate input and delegate to services
- **Middleware**: CORS, JWT validation, error handling
- **WebSocket Managers**: `ConnectionManager` class for broadcast messaging
- **Lifespan**: Startup creates DB tables; shutdown cleans up

### Service Layer
- **pump_service.py**: CRUD, nearby search (haversine), queue history
- **recommendation_engine.py**: 100-point scoring algorithm
- **price_service.py**: City prices, trends, fuel comparisons
- **notification_service.py**: Alert trigger evaluation
- **traffic_service.py**: Wraps ML TrafficAnalyzer

### ML Models Layer
- **CongestionPredictor**: Time-of-day + day-of-week pattern analysis
- **QueuePredictor**: M/D/1 queue theory for wait time estimation
- **TrafficAnalyzer**: Haversine + peak hour traffic factor
- **DemandForecaster**: 24-hour demand prediction with seasonal factors

### Database Layer
- **PostgreSQL**: Primary data store for all entities
- **SQLAlchemy ORM**: Session management with `get_db()` dependency injection
- **UUID primary keys**: All entities use `UUID(as_uuid=True)`
- **Connection pool**: 10 base connections, 20 overflow

## Data Models

```
Users ──< Alerts >── CNG_Pumps ──< Queue_History
  │                      │
  └──< Chat_Messages      └──< Pump_Prices
  │                      │
  └──< Reviews >─────────┘
```

## Authentication Flow

```
Client → POST /api/auth/login
       ← { access_token (30min), refresh_token (7days) }

Client → GET /api/protected (Authorization: Bearer <access_token>)
       → JWT decode → get_current_user() → User object

If 401 → POST /api/auth/refresh (refresh_token)
        ← new access_token
```

## WebSocket Architecture

Two WebSocket endpoints use shared `ConnectionManager` instances:
- `/ws/pumps/live`: Broadcasts pump updates every 30 seconds to all connected clients
- `/ws/alerts`: Bidirectional channel for alert notifications

## Recommendation Algorithm

```
score = crowd_score(40) + wait_score(25) + distance_score(15)
      + rating_score(12) + facilities_score(8)

crowd_score    = 40 × (1 - crowd_level/100)
wait_score     = 25 × (1 - min(wait_min, 60)/60)
distance_score = 15 × (1 - min(distance_km, 20)/20)
rating_score   = 12 × (rating - 1)/4
facilities_score = 8 × (active_facilities / total_facilities)
```

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT signed with HS256 algorithm
- Token types (`access`/`refresh`) validated to prevent token confusion
- Admin/Moderator RBAC via dependency injection decorators
- CORS origins configurable via environment
