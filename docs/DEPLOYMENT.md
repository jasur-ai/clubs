# Deployment

## 1. Environment

Copy `.env.example` to `.env` and fill:

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Public HTTPS URL. Used in metadata, bot buttons and sitemap |
| `AUTH_SECRET` | yes | `openssl rand -base64 48`; rotating it invalidates all sessions |
| `DATABASE_URL` | yes | `file:./dev.db` locally, PostgreSQL URL in production |
| `TELEGRAM_BOT_TOKEN` | for bot | From BotFather |
| `TELEGRAM_BOT_USERNAME` | optional | Display only |
| `TELEGRAM_WEBHOOK_SECRET` | for bot | Random string; Telegram echoes it in a header |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | seed only | Change before first production seed |
| `ALLOW_DEMO_LOGIN` | optional | `1` enables passwordless role preview; never in production |

Never commit `.env`. The repository ships `.env.example` only.

## 2. One-click deploy on Render

The repository ships `render.yaml` (web service + managed PostgreSQL) and a
multi-stage `Dockerfile`. Render reads both automatically:

1. Render Dashboard → **New → Blueprint** → select `jasur-ai/clubs` → branch `main`.
2. Render creates `tsue-clubs-db` and the `tsue-clubs` web service.
3. Fill the values it cannot generate:
   - `NEXT_PUBLIC_SITE_URL` — `https://tsue-clubs.onrender.com` (or a custom domain)
   - `TELEGRAM_BOT_TOKEN` — from BotFather
   - `SEED_ADMIN_PASSWORD` — a fresh password for `admin@clubs.tdiu.uz`
4. Deploy. The container runs `prisma db push` + `seed-if-empty` on boot, so the
   database is created and filled on the first start and left untouched after that.
5. When the service is healthy, `NEXT_PUBLIC_SITE_URL` is HTTPS and
   `src/instrumentation.node.ts` registers the webhook and the Mini App menu button
   by itself. Nothing else to run.

`render.yaml` sets `ALLOW_DEMO_LOGIN=0`; demo role switching is a development tool
only.

### Deploying from a laptop with the Render API

```bash
export RENDER_API_KEY=...          # Account Settings → API Keys
curl -s -X POST https://api.render.com/v1/blueprints \
  -H "Authorization: Bearer $RENDER_API_KEY" -H "Content-Type: application/json" \
  -d '{"repo":"https://github.com/jasur-ai/clubs","branch":"main","name":"tsue-clubs"}'
```

### This deployment

| | |
| --- | --- |
| Site | https://tsue-clubs.onrender.com |
| Service | `srv-dbb5cdon74is73blv3m0` (Docker, Frankfurt) |
| Database | `tsue-clubs-db`, PostgreSQL 16 (internal URL in `DATABASE_URL`) |
| Bot | [@Tsue_clubs_bot](https://t.me/Tsue_clubs_bot) — webhook `/api/telegram`, menu button `/tg` |
| Admin | `admin@clubs.tdiu.uz` — password in the `SEED_ADMIN_PASSWORD` env var |

`ALLOW_DEMO_LOGIN=0` on the live service: the demo role switcher exists only for
local development.

## 3. Database

Local development uses SQLite (`prisma/dev.db`). Production should use PostgreSQL:

1. Create the database (Neon, Supabase, RDS or a managed university instance).
2. In `prisma/schema.prisma` change `provider = "sqlite"` to `"postgresql"`.
3. Set `DATABASE_URL` to the connection string (append `?sslmode=require` where needed).
4. Run `npx prisma db push` (or `prisma migrate deploy` once you start versioning migrations).
5. `npm run db:seed` to create clubs, the admin account, books, events and news.

Backups: nightly `pg_dump` is sufficient; the database is small and append-mostly.

## 4. Build and run

```bash
npm ci
npx prisma generate
npm run build
npm run start        # binds 0.0.0.0:3000
```

Any Node 20+ host works (Vercel, Render, Fly.io, a university VM behind Nginx). If you deploy on
Vercel, set all environment variables in the project settings and use a pooled PostgreSQL URL.

Reverse proxy notes: forward `X-Forwarded-Proto`, keep the body size limit above 1 MB (webhook
payloads are small), and serve the app over HTTPS — Telegram refuses non-HTTPS web-app URLs.

## 5. Telegram

```bash
NEXT_PUBLIC_SITE_URL=https://clubs.tdiu.uz \
TELEGRAM_BOT_TOKEN=... \
TELEGRAM_WEBHOOK_SECRET=... \
npm run tg:webhook
```

The script calls `setWebhook` with `allowed_updates` and registers the command list. Verify:

```bash
curl "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo"
```

Then in BotFather:

1. `/setmenubutton` → `https://clubs.tdiu.uz/tg` — the Mini App entry.
2. `/setdescription`, `/setabouttext` — Uzbek copy, no emoji.
3. Add the bot as admin to the club channel if it should read posts later.

Local development: Telegram cannot reach `localhost`. Use a tunnel (Cloudflare Tunnel,
`ngrok http 3000`) and set `NEXT_PUBLIC_SITE_URL` to the tunnel URL before `npm run tg:webhook`.

## 6. First-run checklist

- [ ] `.env` filled, `AUTH_SECRET` rotated away from the example
- [ ] `npm run db:setup` completes; `admin@clubs.tdiu.uz` login works
- [ ] Admin password changed; demo login disabled in production
- [ ] Club contacts reviewed in `/admin/clubs`
- [ ] Book Club cycle started in `/admin/reading`; milestones dated
- [ ] First news item published; sitemap reachable at `/sitemap.xml`
- [ ] Webhook registered and `/start` answers in Telegram
- [ ] Mini App opens from the bot menu button and lands on `/app`
- [ ] Backup job scheduled for the database

## 7. Operations

- Notifications are written to `Notification`; the Mini App shows unread counts. Delivery through
  the bot can be added by a worker that reads undelivered rows (the schema already separates
  creation from delivery).
- Audit entries are append-only and visible in `/admin/settings`.
- Logs: the webhook logs failed Bot API calls with the method name; the app logs Prisma errors.
- Health: `GET /api/health` returns `{ ok: true, db: true }`.
