# Vaya Rides (Lesotho Ride-Hailing Platform) — Backend

A Lesotho-focused ride-hailing system (inspired by Uber) providing a complete passenger → driver → ride → payment → earnings workflow, supporting M-Pesa, EcoCash, and Bank payments.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **API Framework:** Express
- **Database:** PostgreSQL + PostGIS
- **ORM:** Prisma (v7)
- **Cache/Geo:** Redis
- **Real-time:** Socket.IO
- **Validation:** Zod
- **Auth:** JWT + bcrypt

## Project Status

🚧 **In active development (MVP1)**

- [x] Project setup, Docker (Postgres + PostGIS, Redis)
- [x] Auth module (register, login, JWT, `/users/me`)
- [x] Driver registration, vehicle registration, admin approval flow
- [x] Ride creation, fare estimation, ride state machine
- [ ] Driver matching engine (in progress)
- [ ] Redis + Socket.IO real-time tracking
- [ ] Payment integrations (M-Pesa, EcoCash, Bank)
- [ ] Driver earnings, ratings, notifications
- [ ] Admin dashboard endpoints
- [ ] E2E testing

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop

### Setup

1. Clone the repo:
```bash
   git clone https://github.com/YOUR-USERNAME/lesotho-ride-hailing-backend.git
   cd lesotho-ride-hailing-backend
```

2. Install dependencies:
```bash
   npm install
```

3. Copy the environment file and fill in your values:
```bash
   cp .env.example .env
```

4. Start Postgres + Redis:
```bash
   docker compose up -d
```

5. Run database migrations:
```bash
   npx prisma migrate dev
```

6. Start the dev server:
```bash
   npm run dev
```

   Server runs at `http://localhost:4000` by default. Confirm it's up:
```bash
   curl http://localhost:4000/health
```

## Project Structure
