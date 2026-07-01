<div align="center">

# 🏺 Artisan SaaS

### Voice-first inventory management for rural artisans — built for the edge of connectivity.

**No signal? No problem. Every action is captured offline, verified on-chain, and synced the moment you're back online.**

[![CI](https://img.shields.io/badge/CI-passing-66BB6A?style=for-the-badge)](.)
[![Tests](https://img.shields.io/badge/tests-134%20passing-A0522D?style=for-the-badge)](.)
[![License](https://img.shields.io/badge/license-MIT-D4A574?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20-333333?style=for-the-badge&logo=node.js&logoColor=white)](.)

<br/>

`English` · `हिन्दी` · `தமிழ்` · `ಕನ್ನಡ` · `తెలుగు`

</div>

---

## Why this exists

Most inventory software assumes three things that don't hold true for a potter in a village outside Hyderabad: reliable internet, comfort typing on a screen, and trust in a centralized company holding their business records.

**Artisan SaaS inverts all three.**

- 📴 **Offline is the default state, not the exception.** The app is fully usable with zero connectivity — every write queues locally and syncs silently the moment a signal returns.
- 🎙️ **Voice is the primary interface.** Typing is the fallback, not the other way around. Speak your inventory in five languages; the app listens, transcribes, and acts.
- 🔐 **Trust is cryptographic, not corporate.** Every transaction is signed with the artisan's own key and anchored to a Ceramic DID ledger — an immutable, artisan-owned record no company can quietly edit.

This repo is the full-stack implementation: a Node.js/Express API, a React Native (Expo) mobile app, and a blockchain-backed ledger layer, wired together end to end.

---

## See it in action

```
🎤  "Add ten kilograms of clay"
     ↓
     ✓ transcribed (Whisper WASM, on-device)
     ↓
     ✓ parsed → { action: ADD, item: "clay", qty: 10, unit: "kg" }
     ↓
     ✓ written to local queue          [instant, works offline]
     ↓
     ⏳ pending sync...
     ↓
     ✓ synced to PostgreSQL             [when connectivity returns]
     ↓
     ✓ signed + anchored to Ceramic DID [tamper-proof, permanent]
```

No screen taps. No forms. No connectivity required until the very last step.

---

## Architecture at a glance

```
┌──────────────────────────────────────────────────────────────────┐
│                         MOBILE (Expo)                              │
│                                                                      │
│   🎤 VoiceInput  →  whisper.ts  →  voiceParser.ts  →  syncEngine.ts│
│         │                                                    │      │
│    SyncBadge ◄──────────────────── offline queue ────────────┘      │
│         │                                                            │
└─────────┼────────────────────────────────────────────────────────┘
          │  syncs when online
          ▼
┌──────────────────────────────────────────────────────────────────┐
│                      API (Express + TypeScript)                    │
│                                                                      │
│   /auth  ──JWT──►  /inventory  ──CRUD──►  PostgreSQL 16            │
│                          │                                          │
│                          ▼                                          │
│                     /ledger  ──sign (Ed25519)──►  Ceramic DID       │
└──────────────────────────────────────────────────────────────────┘
```

**The core design bet:** everything above the sync line works with the phone in airplane mode. Everything below it is where trust gets made permanent.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Mobile** | React Native (Expo SDK 56), Redux Toolkit, Expo Router | One codebase, native performance, OTA updates without app-store delays |
| **API** | Express.js, TypeScript, PostgreSQL 16, Redis 7 | Boring, battle-tested, easy to operate at small scale |
| **Auth** | Phone OTP (Twilio) + JWT | No email required — matches how rural users actually identify themselves |
| **Blockchain** | Ceramic DID, Ed25519 signing | Artisan-owned identity; no central authority can rewrite history |
| **Voice** | `@xenova/transformers` (WASM Whisper) | Runs entirely on-device — no cloud round-trip, works offline |
| **DevOps** | Docker, GitHub Actions, Railway | Reproducible environments, one-command deploys |

---

## Quick Start

### Prerequisites

```
Node.js  ≥ 20
Docker + Docker Compose
npm      ≥ 10
```

### 1 · Clone & install

```bash
git clone https://github.com/your-org/artisan-saas.git
cd artisan-saas
npm install
```

### 2 · Start infrastructure

```bash
docker compose up -d
```
Spins up PostgreSQL 16 and Redis 7 in the background.

### 3 · Configure environment

```bash
cp .env.example .env
```
Fill in `TWILIO_*`, `JWT_SECRET`, and `CERAMIC_URL` before running auth or ledger routes.

### 4 · Migrate & seed the database

```bash
cd server
npm run db:migrate
npm run db:seed      # seeds 5 sample artisans + inventory
cd ..
```

### 5 · Run it

```bash
# Terminal 1 — API
cd server && npm run dev

# Terminal 2 — Mobile
cd frontend && npm start
```

| Service | URL |
|---|---|
| API | `http://localhost:3001` |
| Expo Dev Server | `http://localhost:8081` |

Scan the QR code with Expo Go, or press `i` / `a` for a simulator.

---

## Testing

```bash
# Server — 82 tests
cd server && npm test

# Frontend — 52 tests
cd frontend && npx jest
```

**134 tests, zero flakes.** Every route, every voice command permutation, every sync conflict scenario is covered.

---

## Project Structure

```
artisan-saas/
├── server/                       Express.js API
│   └── src/
│       ├── app.ts                 Express app setup
│       ├── index.ts                Server entry point
│       ├── config.ts               Environment config
│       ├── db/
│       │   ├── pool.ts             PostgreSQL connection
│       │   ├── schema.ts           DB schema + migrations
│       │   ├── migrate.ts          Migration runner
│       │   └── seed.ts             Seed data (5 artisans)
│       ├── middleware/
│       │   ├── auth.ts             JWT authentication
│       │   └── errorHandler.ts
│       ├── routes/
│       │   ├── auth.ts             Phone OTP + JWT auth
│       │   ├── inventory.ts        CRUD inventory
│       │   └── ledger.ts           Ceramic DID ledger
│       ├── services/
│       │   └── ceramic.ts          DID generation, signing, Ceramic
│       └── validators/
│           └── index.ts            Zod schemas
│
├── frontend/                     React Native (Expo) app
│   ├── app/                       Expo Router pages
│   │   ├── _layout.tsx             Root layout (Redux Provider)
│   │   └── (tabs)/
│   │       ├── _layout.tsx         Tab navigator
│   │       ├── index.tsx           Home (inventory list)
│   │       └── settings.tsx        Settings + dark mode
│   └── src/
│       ├── components/
│       │   ├── VoiceInput.tsx      Mic button, pulse animation
│       │   ├── SyncBadge.tsx       Offline sync status
│       │   └── LedgerProof.tsx     Blockchain proof display
│       ├── services/
│       │   ├── whisper.ts          WASM speech-to-text
│       │   ├── voiceParser.ts      Multi-language intent parser
│       │   ├── syncEngine.ts       Offline queue + sync
│       │   └── ceramic.ts          Ledger API client
│       ├── redux/
│       │   ├── store.ts            Redux store
│       │   └── slices/inventory.ts
│       └── theme/
│           └── colors.ts           Earth-tone design system
│
├── docker-compose.yml             Full stack: postgres + redis + server
├── .github/workflows/ci.yml       GitHub Actions CI
├── railway.json                    Railway deployment config
└── scripts/deploy-staging.sh       Staging deploy script
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/request-otp` | Request OTP for phone number |
| `POST` | `/auth/verify-otp` | Verify OTP → returns JWT |

### Inventory
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/inventory` | List all items + summary stats |
| `GET` | `/inventory/:id` | Get single item |
| `POST` | `/inventory` | Create new item |
| `PATCH` | `/inventory/:id` | Update item |
| `DELETE` | `/inventory/:id` | Delete item |

### Ledger (Ceramic DID)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/ledger/config` | Configure Ceramic endpoint |
| `POST` | `/ledger/did` | Generate DID for user |
| `GET` | `/ledger/did` | Get user's DID info |
| `POST` | `/ledger/record` | Sign + record a transaction |
| `GET` | `/ledger/history` | Full ledger history |
| `GET` | `/ledger/verify/:txId` | Verify a transaction's signature |
| `GET` | `/ledger/proof/:txId` | Get cryptographic proof of a transaction |

---

## Voice Commands

Five languages, one grammar. Say it naturally — the parser handles the rest.

| Say this | It does this |
|---|---|
| *"Add 10 kg clay"* | Adds inventory |
| *"Sell 5 pieces pottery"* | Records a sale |
| *"Remove 2 liters glaze"* | Removes stock |
| *"How much cotton do I have"* | Checks quantity |
| *"Set reorder alert at 20 kg"* | Sets a reorder threshold |

Supported: **English · Hindi · Tamil · Kannada · Telugu**

---

## Design System

An earth-tone palette, deliberately — no default Material blue, no generic SaaS gradient. Clay, ochre, and indigo, because that's what's actually in an artisan's hands.

| Token | Light | Dark |
|---|---|---|
| **Primary** | `#A0522D` burnt sienna | `#D4A574` clay |
| **Background** | `#FBF7F3` | `#1A1A1A` |
| **Surface** | `#FFFFFF` | `#2D2D2D` |
| **Success** | `#66BB6A` | `#81C784` |
| **Error** | `#EF5350` | `#EF5350` |

---

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

- [ ] Set a strong `JWT_SECRET`
- [ ] Configure Twilio for phone OTP
- [ ] Stand up a Ceramic node (or use a hosted provider)
- [ ] Configure Razorpay for payments
- [ ] Wire up Sentry for error tracking
- [ ] Enable PostgreSQL automated backups
- [ ] Lock CORS to the production domain
- [ ] Terminate SSL/TLS at the edge

---

<div align="center">

### Built for the places where the internet doesn't always reach — but trust still has to.

**License:** MIT

</div>
