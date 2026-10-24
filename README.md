# 🚆 IRCTC Backend: Microservices Railway Booking System

Event-driven railway booking backend (IRCTC clone) built with Node.js, Kafka, PostgreSQL, Redis and Elasticsearch.

## Features

- **API Gateway**: single entrypoint with JWT enforcement, per-route rate limiting and circuit breakers
- **Auth**: email OTP, JWT (access + refresh rotation), Google OAuth
- **Booking Saga**: lock seats → create payment order → confirm or roll back via Kafka events
- **Concurrency Control**: segment-level seat locks with auto-expiry (background job every 60s)
- **Search**: Elasticsearch-backed train search and station autocomplete, kept in sync via Kafka
- **Payments**: Razorpay orders, signature verification, webhooks, refunds
- **Resilience**: database-per-service, retry (3x) + Dead-Letter Queue on every Kafka consumer

## Architecture

```
Frontend (3000) → API Gateway (4000) → ┬ User (4001)       → Postgres + Redis
                                       ├ Search (4002)     → Elasticsearch
                                       ├ Admin (4003)      → Postgres
                                       ├ Booking (4005)    → Postgres + Redis
                                       ├ Payment (4006)    → Postgres
                                       └ Inventory (4007)  → Postgres

Notification (4004): Kafka consumer only, sends emails via SendGrid
All async flows go through Kafka (topics in shared/constants/kafka-topics.js)
```

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js 18+, Express 5, Prisma 7, KafkaJS, Winston |
| Data | PostgreSQL 15, Redis Stack, Elasticsearch 8.12 |
| Messaging | Apache Kafka + Zookeeper |
| Integrations | Razorpay, SendGrid, Google OAuth |
| Frontend | React 18, Vite, Tailwind, Zustand |
| DevOps | Docker Compose |

## Services

| Service | Port | Responsibility |
|---|---|---|
| Frontend | 3000 | React UI |
| API Gateway | 4000 | Routing, JWT, rate limit, circuit breaker |
| User | 4001 | OTP, login, JWT, Google OAuth, profile |
| Search | 4002 | Train search, station autocomplete |
| Admin | 4003 | Stations, trains, routes, schedules |
| Notification | 4004 | Email consumer (no HTTP) |
| Booking | 4005 | Booking saga orchestration |
| Payment | 4006 | Razorpay orders, webhooks, refunds |
| Inventory | 4007 | Seat availability and locks |

Gateway routes: `/api/users`, `/api/search`, `/api/admins`, `/api/bookings`, `/api/payments`, `/api/inventory`

## Kafka Flow

```
admin.*  ───────────► inventory-service, search-service
inventory.seat-availability-updated ──► search-service
payment.success / payment.failed ─────► booking-service
booking.confirmed / failed / cancelled ► notification-service
notification.otp-email / welcome-email ► notification-service
dlq.<service> ◄── failed messages after 3 retries
```

## Getting Started

**Prerequisites:** Node.js ≥ 18, Docker, Docker Compose

```bash
# 1. Clone
git clone https://github.com/neelcc/irctc-backend.git
cd irctc-backend

# 2. Start infrastructure (Postgres, Redis, Kafka, Elasticsearch, UIs)
docker-compose up -d

# 3. Setup each service
cd <service-name>
npm install
cp .env.example .env        # fill in secrets

# Prisma services only: user, admin, booking, payment, inventory
npx prisma migrate dev --name init
npx prisma generate

# 4. Run (one terminal per service, in this order)
# admin → inventory → search → user → payment → booking → notification → api-gateway → frontend
npm run dev
```

Frontend: http://localhost:3000 (proxies `/api` to the gateway)

## Dev Tools

| Tool | URL |
|---|---|
| pgAdmin | http://localhost:8081 |
| RedisInsight | http://localhost:8001 |
| Kafka UI | http://localhost:8080 |
| Kibana | http://localhost:5601 |

## Environment Variables

Each service has a `.env.example`. Key variables:

```env
PORT=
DATABASE_URL=postgres://admin:irctcpass@localhost:5432/<service>_database
REDIS_URL=redis://:irctcpass@localhost:6379
KAFKA_BROKER=localhost:9093
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
INTERNAL_SERVICE_KEY=      # must be identical across all internal services
SENDGRID_API_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
```

Generate a secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

> Never commit `.env` files. Use 32+ byte secrets and rotate leaked keys.

## Example API Calls

```http
POST /api/users/auth/send-otp
{ "email": "user@example.com" }

GET /api/search/trains?from=NDLS&to=BCT&date=2026-05-01

POST /api/bookings/bookings
Authorization: Bearer <access-jwt>
```

## Project Structure

```
irctc-backend/
├── api-gateway/  user-service/  search-service/  admin-service/
├── notification-service/  booking-service/  payment-service/  inventory-service/
├── frontend/
├── shared/        # kafka-topics.js, dlqHandler.js, asyncHandler.js, error.js
└── docker-compose.yml
```

Each service: `src/{config,routes,controllers,services,middlewares,kafka,utils}`, plus `prisma/` where applicable.
