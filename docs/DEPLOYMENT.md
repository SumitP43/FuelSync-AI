# FuelSync-AI Deployment Guide

## Local Development

```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start with auto-reload
PYTHONPATH=. uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```

## Docker Deployment

### Build & Run
```bash
# Build all services
docker compose -f docker/docker-compose.yml build

# Start in detached mode
docker compose -f docker/docker-compose.yml up -d

# View logs
docker compose -f docker/docker-compose.yml logs -f api

# Stop
docker compose -f docker/docker-compose.yml down
```

### First-Time Setup
```bash
docker exec fuelsync_api python scripts/init_db.py
docker exec fuelsync_api python scripts/seed_data.py
```

## Production Checklist

- [ ] Set a strong `SECRET_KEY` (minimum 32 characters)
- [ ] Set `DEBUG=false`
- [ ] Set `ENVIRONMENT=production`
- [ ] Configure `CORS_ORIGINS` to your actual domain(s)
- [ ] Use a managed PostgreSQL service (e.g., AWS RDS, Supabase)
- [ ] Set up HTTPS with a reverse proxy (Nginx / Caddy / Traefik)
- [ ] Configure Redis for session/cache
- [ ] Set `ANTHROPIC_API_KEY` for Claude AI chat
- [ ] Set `GOOGLE_MAPS_API_KEY` for map display
- [ ] Set up database backups
- [ ] Configure log aggregation

## Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        root /var/www/fuelsync/frontend;
        try_files $uri /index.html;
    }
}
```

## Environment Variables Reference

| Variable | Production Value |
|----------|-----------------|
| `DATABASE_URL` | `postgresql://user:pass@rds-host:5432/fuelsync_db` |
| `SECRET_KEY` | Random 64-char string |
| `DEBUG` | `false` |
| `ENVIRONMENT` | `production` |
| `CORS_ORIGINS` | `["https://yourdomain.com"]` |

## Scaling

For horizontal scaling, the API is stateless — WebSocket state should be moved to Redis pub/sub:

```bash
# Scale API workers
docker compose up --scale api=3
```

## Database Migrations

```bash
# Generate migration
python scripts/migrations.py create "add new column"

# Apply migrations
python scripts/migrations.py
```

## Health Check

```bash
curl http://localhost:8000/health
# {"status":"healthy","version":"1.0.0"}
```
