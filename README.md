# FactoryLens (ForgeX)

A dairy-factory operations dashboard with a live Postgres backend, MQTT-based OT telemetry
ingestion, on-demand threshold alerting, and an AI-assisted investigation engine. See
[PLANNING.md](./PLANNING.md) for architecture decisions and current project status.

## Prerequisites

- Node.js 20+ and npm
- Docker (for Postgres and the MQTT broker)

## 1. Install dependencies

```bash
npm install
```

## 2. Configure environment variables

```bash
cp .env.example .env
```

The defaults in `.env.example` already match `docker-compose.yml`, so `DATABASE_URL` works as-is
for local development. Notes on the other variables:

- `AUTH_SECRET` — signs session JWTs. Generate one with `openssl rand -base64 32`. In dev,
  NextAuth will auto-generate an ephemeral one if left unset, but set a real value for anything
  beyond a quick local run.
- `AUTH_URL` — optional, only needed when accessing the app through a tunnel (ngrok, Cloudflare
  Tunnel) for a demo. Set it to the tunnel's current URL before starting it; otherwise
  login/logout redirects to `localhost:3000` instead of the tunnel URL (Next.js's dev server
  computes request origins from its own bind address, not the tunnel's `Host` header). Leave
  unset for plain local dev.
- `GEMINI_API_KEY` — optional. Powers the AI Assistant chat (`/api/v1/gemini/assistant`) and
  polishes investigation summaries into readable prose. If unset (or every model call fails),
  both fall back to a response built from real data instead of AI output — never a fabricated one.
- `GEMINI_MODELS` — optional, comma-separated model names tried in order (first = primary, rest
  are fallbacks used only if an earlier one actually errors — rate limit, outage, retired model).
  Defaults to `gemini-3.8-flash` alone if unset. See `lib/server/gemini.ts`.
- `APP_URL` — only relevant when deployed; safe to leave as-is for local dev.

## 3. Start Postgres and the MQTT broker

```bash
npm run db:up
```

This runs `docker compose up -d`, starting:
- **Postgres** on `localhost:5432` (user/pass/db: `forgex`/`forgex`/`forgex`)
- **Mosquitto** (MQTT broker) on `localhost:1883`

Stop them later with `npm run db:down`.

## 4. Run database migrations

```bash
npm run db:migrate
```

This applies all Prisma migrations (`prisma migrate dev`) to the Postgres instance started above.

## 5. Seed the database

```bash
npm run db:seed
```

Seeds the organization, factory, users, production lines/machines, the hero demo incident
(alert + investigation + action tasks), and reference data (materials, maintenance records,
device connections, etc).

Demo login (seeded, Admin role):
- Email: `elena.rostova@lactapuredairy.com`
- Password: `ForgeX-Demo-2026!`

(Every seeded user shares this same password — see `prisma/seedData.ts` for the full user list
and their roles.)

> Re-running `npm run db:seed` on a non-empty database will fail on unique-constraint errors.
> To start fresh, use the in-app **Reset Demo Scenario** button (header or sidebar) instead,
> which resets state via `/api/v1/demo/reset` without needing a full reseed.

## 6. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with the demo credentials above.

## 7. (Optional) Run live telemetry

The live Machine telemetry feed, on-demand threshold alerting, and AI investigation generation
all depend on real MQTT data flowing in. In two separate terminals:

```bash
npm run simulate:telemetry   # stands in for OT hardware — publishes readings for mach-m03, mach-m01
npm run ingest:telemetry     # subscribes to the broker and persists readings via Prisma
```

Leave both running alongside `npm run dev`. `mach-m03`'s seeded vibration baseline sits above the
configured anomaly threshold (by design, as the demo's problem machine); `mach-m01` stays healthy
as a contrast. Once readings are flowing, use **Run Threshold Check** (Alerts tab) to raise a new
alert from live data, then **Investigate with AI** on it.

## Other useful scripts

```bash
npm run db:studio   # Prisma Studio — browse/edit the database directly
npm run lint        # ESLint
npm run build        # Production build
```
