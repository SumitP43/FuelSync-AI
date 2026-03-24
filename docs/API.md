# FuelSync-AI API Reference

Base URL: `http://localhost:8000`

Interactive docs: `/docs` (Swagger UI) | `/redoc` (ReDoc)

## Authentication

All protected endpoints require a Bearer JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

### POST /api/auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "phone": "+919876543210",
  "city": "Mumbai",
  "language": "en"
}
```

**Response 201:**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer",
  "user": { "id": "uuid", "email": "...", "name": "...", "role": "user" }
}
```

---

### POST /api/auth/login
Login and receive JWT tokens.

**Request Body:** `{ "email": "...", "password": "..." }`

**Response 200:** Same as register response.

---

### POST /api/auth/refresh
Refresh an expired access token.

**Request Body:** `{ "refresh_token": "eyJ..." }`

**Response 200:** `{ "access_token": "eyJ...", "token_type": "bearer" }`

---

### GET /api/auth/me *(Auth required)*
Get the current authenticated user's profile.

---

## Pumps

### GET /api/pumps/
List CNG pumps with optional filters.

**Query Parameters:**
- `city` (string) — Filter by city (partial match)
- `area` (string) — Filter by area (partial match)
- `status` (string) — `open`, `closed`, `maintenance`
- `limit` (int, default=20, max=100)
- `offset` (int, default=0)

**Response 200:**
```json
{
  "pumps": [
    {
      "id": "uuid",
      "name": "MGL CNG - Andheri West",
      "area": "Andheri West",
      "city": "Mumbai",
      "address": "S.V. Road, Andheri West",
      "latitude": 19.1364,
      "longitude": 72.8296,
      "current_crowd_level": 45,
      "crowd_label": "Medium",
      "status": "open",
      "avg_rating": 4.2,
      "review_count": 15,
      "facilities": { "air": true, "water": true, "restroom": false, "shop": true, "ev_charger": false },
      "is_24x7": true,
      "distance_km": 1.2
    }
  ],
  "count": 1
}
```

---

### GET /api/pumps/nearby
Find pumps near a geographic coordinate.

**Query Parameters:**
- `lat` (float, required) — Latitude
- `lng` (float, required) — Longitude
- `radius` (float, default=5.0) — Search radius in km
- `limit` (int, default=10)

---

### GET /api/pumps/{pump_id}
Get details of a specific pump.

---

### POST /api/pumps/ *(Admin required)*
Create a new pump.

**Request Body:**
```json
{
  "name": "New CNG Station",
  "area": "Bandra",
  "city": "Mumbai",
  "address": "Linking Road, Bandra West",
  "latitude": 19.0596,
  "longitude": 72.8295,
  "max_capacity": 50,
  "is_24x7": false,
  "facilities": { "air": true, "water": true, "restroom": false, "shop": false, "ev_charger": false }
}
```

---

### GET /api/pumps/{pump_id}/queue-history
Get historical queue data for a pump.

**Query Parameters:** `limit` (default=24, max=168)

**Response:**
```json
{
  "pump_id": "uuid",
  "history": [
    { "timestamp": "2024-01-15T10:00:00", "vehicle_count": 12, "crowd_level": 40, "wait_time_minutes": 8.5 }
  ]
}
```

---

### POST /api/pumps/{pump_id}/reviews *(Auth required)*
Submit a review for a pump.

**Request Body:** `{ "rating": 4, "text": "Quick service, clean facility." }`

---

## Recommendations

### POST /api/recommendations/
Get AI-powered pump recommendations based on location and preferences.

**Request Body:**
```json
{
  "lat": 19.0760,
  "lng": 72.8777,
  "radius_km": 10.0,
  "preferences": null
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "id": "uuid",
      "name": "...",
      "score": 78.5,
      "distance_km": 1.8,
      "estimated_wait_minutes": 6.0,
      "current_crowd_level": 25
    }
  ]
}
```

**Scoring Algorithm (100 points total):**
- Crowd score: 40 pts (lower crowd = higher score)
- Wait time score: 25 pts (shorter wait = higher score)
- Distance score: 15 pts (closer = higher score)
- Rating score: 12 pts (based on 1–5 stars)
- Facilities score: 8 pts (number of available facilities)

---

### GET /api/recommendations/best-pick
Get the single best pump right now.

**Query Parameters:** `lat`, `lng` (required)

---

### GET /api/recommendations/trending
Get trending pumps (high rating, low crowd).

---

## Prices

### GET /api/prices/today
Today's average CNG price per city.

**Response:**
```json
{
  "prices": [
    { "city": "Mumbai", "avg_price": 79.0, "min_price": 78.5, "max_price": 79.5, "date": "2024-01-15" }
  ]
}
```

---

### GET /api/prices/comparison
CNG vs Petrol vs Diesel price comparison.

**Query Parameters:** `city` (default="Mumbai")

**Response:**
```json
{
  "city": "Mumbai",
  "cng_per_kg": 79.0,
  "petrol_per_litre": 106.31,
  "diesel_per_litre": 94.27,
  "cng_savings_vs_petrol": 25.7,
  "cng_savings_vs_diesel": 16.2
}
```

---

## Alerts

### POST /api/alerts/ *(Auth required)*
Create a crowd alert for a pump.

**Request Body:**
```json
{ "pump_id": "uuid", "threshold": "low" }
```

Threshold values: `low` (≤30%), `medium` (≤60%), `high` (≤80%)

---

### GET /api/alerts/notifications *(Auth required)*
Get recently triggered alert notifications.

---

## Chat

### POST /api/chat/message *(Auth required)*
Send a message to the AI assistant.

**Request Body:** `{ "message": "Find the nearest pump with low crowd", "context": null }`

**Response:** `{ "id": "uuid", "message": "...", "response": "...", "timestamp": "..." }`

---

## Admin

All admin endpoints require `role: admin`.

### GET /api/admin/stats
System-wide statistics.

### GET /api/admin/users
List all users (paginated).

### GET /api/admin/pumps/analytics
Pump analytics by city and status.

### POST /api/admin/prices
Update CNG prices.

---

## WebSocket

### WS /ws/pumps/live
Live pump crowd updates broadcast every 30 seconds.

**Message format:**
```json
{
  "type": "pump_update",
  "pumps": [
    { "id": "uuid", "name": "...", "current_crowd_level": 45, "current_vehicles": 22, "status": "open" }
  ]
}
```

---

## Error Responses

| Status | Description |
|--------|-------------|
| 400 | Bad Request — validation error or business rule violation |
| 401 | Unauthorized — missing or invalid JWT token |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found — resource does not exist |
| 422 | Unprocessable Entity — Pydantic validation error |
| 500 | Internal Server Error |
