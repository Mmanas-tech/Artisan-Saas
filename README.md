# Artisan SaaS

Voice-first inventory management platform for rural artisans. Offline-first mobile app with Ceramic DID blockchain ledger, multi-language voice commands, and micro-financing integration.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native (Expo SDK 56), Redux Toolkit, Expo Router |
| API | Express.js, TypeScript, PostgreSQL 16, Redis 7 |
| Auth | Phone OTP (Twilio) + JWT |
| Blockchain | Ceramic DID, Ed25519 signing |
| Voice | @xenova/transformers (WASM Whisper) |
| DevOps | Docker, GitHub Actions, Railway |

## Prerequisites

- **Node.js** >= 20
- **Docker** + Docker Compose
- **npm** >= 10

## Quick Start

### 1. Clone and install

```bash
git clone https://github.com/your-org/artisan-saas.git
cd artisan-saas
npm install
```

### 2. Start infrastructure

```bash
docker compose up -d
```

### 3. Configure environment

```bash
cp .env.example .env
```

### 4. Migrate and seed database

```bash
cd server
npm run db:migrate
npm run db:seed
cd ..
```

### 5. Start development servers

```bash
# Terminal 1 - API
cd server
npm run dev

# Terminal 2 - Mobile
cd frontend
npm start
```

API runs at `http://localhost:3001`. Expo dev server runs at `http://localhost:8081`.

## Testing

### Server (82 tests)

```bash
cd server
npm test
```

### Frontend (52 tests)

```bash
cd frontend
npx jest
```

## Project Structure

```
artisan-saas/
├── server/                    # Express.js API
│   ├── src/
│   │   ├── app.ts             # Express app setup
│   │   ├── index.ts           # Server entry point
│   │   ├── config.ts          # Environment config
│   │   ├── db/
│   │   │   ├── pool.ts        # PostgreSQL connection
│   │   │   ├── schema.ts      # DB schema + migrations
│   │   │   ├── migrate.ts     # Migration runner
│   │   │   └── seed.ts        # Seed data (5 artisans)
│   │   ├── middleware/
│   │   │   ├── auth.ts        # JWT authentication
│   │   │   └── errorHandler.ts
│   │   ├── routes/
│   │   │   ├── auth.ts        # Phone OTP + JWT auth
│   │   │   ├── inventory.ts   # CRUD inventory
│   │   │   └── ledger.ts      # Ceramic DID ledger
│   │   ├── services/
│   │   │   └── ceramic.ts     # DID generation, signing, Ceramic
│   │   └── validators/
│   │       └── index.ts       # Zod schemas
│   ├── Dockerfile             # Multi-stage Docker build
│   └── package.json
├── frontend/                  # React Native (Expo) app
│   ├── app/                   # Expo Router pages
│   │   ├── _layout.tsx        # Root layout (Redux Provider)
│   │   └── (tabs)/
│   │       ├── _layout.tsx    # Tab navigator
│   │       ├── index.tsx      # Home (inventory list)
│   │       └── settings.tsx   # Settings + dark mode
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoiceInput.tsx # Mic button with pulse animation
│   │   │   ├── SyncBadge.tsx  # Offline sync status
│   │   │   └── LedgerProof.tsx # Blockchain proof display
│   │   ├── services/
│   │   │   ├── whisper.ts     # WASM speech-to-text
│   │   │   ├── voiceParser.ts # Multi-language intent parser
│   │   │   ├── syncEngine.ts  # Offline queue + sync
│   │   │   └── ceramic.ts     # Ledger API client
│   │   ├── redux/
│   │   │   ├── store.ts       # Redux store
│   │   │   └── slices/
│   │   │       └── inventory.ts
│   │   └── theme/
│   │       └── colors.ts      # Earth-tone design system
│   └── package.json
├── docker-compose.yml         # Full stack: postgres + redis + server
├── .github/workflows/ci.yml   # GitHub Actions CI
├── railway.json               # Railway deployment config
└── scripts/
    └── deploy-staging.sh      # Staging deploy script
```

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/request-otp` | Request OTP for phone number |
| POST | `/auth/verify-otp` | Verify OTP, returns JWT |

### Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/inventory` | List all items + stats |
| GET | `/inventory/:id` | Get single item |
| POST | `/inventory` | Create new item |
| PATCH | `/inventory/:id` | Update item |
| DELETE | `/inventory/:id` | Delete item |

### Ledger (Ceramic DID)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/ledger/config` | Configure Ceramic endpoint |
| POST | `/ledger/did` | Generate DID for user |
| GET | `/ledger/did` | Get user's DID info |
| POST | `/ledger/record` | Sign + record transaction |
| GET | `/ledger/history` | Full ledger history |
| GET | `/ledger/verify/:txId` | Verify transaction signature |
| GET | `/ledger/proof/:txId` | Get transaction proof |

## Voice Commands

The app supports voice commands in English, Hindi, Tamil, Kannada, and Telugu:

- "Add 10 kg clay" — Add inventory
- "Sell 5 pieces pottery" — Record sale
- "Remove 2 liters glaze" — Remove stock
- "How much cotton do I have" — Check quantity
- "Set reorder alert at 20 kg" — Set reorder level

## Design System

Earth-tone palette for rural artisan aesthetic:

| Token | Light | Dark |
|-------|-------|------|
| Primary | `#A0522D` (burnt sienna) | `#D4A574` (clay) |
| Background | `#FBF7F3` | `#1A1A1A` |
| Surface | `#FFFFFF` | `#2D2D2D` |
| Success | `#66BB6A` | `#81C784` |
| Error | `#EF5350` | `#EF5350` |

## Deployment

### Staging (Railway)

```bash
npm i -g @railway/cli
railway login
railway link
railway variables set DATABASE_URL="postgresql://..."
railway variables set JWT_SECRET="your-secret"
railway up
```

### Docker Hub

```bash
docker build -t your-org/artisan-server:latest ./server
docker push your-org/artisan-server:latest
```

### Production Checklist

- [ ] Set strong `JWT_SECRET`
- [ ] Configure Twilio for phone OTP
- [ ] Set up Ceramic node (or use 3Box hosted)
- [ ] Configure Razorpay for payments
- [ ] Set up Sentry for error tracking
- [ ] Enable PostgreSQL backups
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS termination

## License

MIT
