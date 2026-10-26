# Architecture

## 1. The unit of the product: a club ecosystem

Every club is treated as a product of its own, not a row in a directory:

```
                        Yoshlar ittifoqi umbrella
                                  |
        +-------------------------+-------------------------+
        |                         |                         |
   Public portal             Club presence             Operations
   (shared news,         site /clubs/[slug]        admin console /admin
    cross-club events,    Telegram bot              join queue, roster,
    directory)            Mini App /app             content, analytics
```

The portal is shared. The club surface is themed per club (`--club-accent`), and the bot and Mini
App are parameterized by `Club.slug`. Phase 1 turns on `book-club`; adding the next club is a
seed/config change plus a bot token, not a code fork.

## 2. Routes

| Route | Access | Notes |
| --- | --- | --- |
| `/`, `/clubs`, `/clubs/[slug]` | public | Directory and club passport |
| `/books`, `/books/[id]` | public | Library, current cycle, discussions teaser |
| `/events`, `/events/[id]` | public + RSVP for members | RSVP requires a session |
| `/news`, `/news/[slug]` | public | General and club news |
| `/join` | public | zod-validated application, duplicate-safe |
| `/login` | public | Email/password; demo role switch in dev |
| `/tg` | Telegram webview | Exchanges `initData` for a session, then redirects to `/app` |
| `/app`, `/app/read`, `/app/discussions`, `/app/discussions/[id]`, `/app/events`, `/app/profile` | member | Mobile-first Mini App shell, bottom navigation |
| `/admin`, `/admin/join-requests`, `/admin/members`, `/admin/books`, `/admin/reading`, `/admin/events`, `/admin/news`, `/admin/clubs`, `/admin/settings` | staff | Desktop console |
| `/api/telegram` | Telegram only | Webhook; guarded by `X-Telegram-Bot-Api-Secret-Token` |

## 3. Data model

15 models in `prisma/schema.prisma`:

- **Identity**: `User`, `Membership`, `JoinRequest`
- **Club**: `Club`
- **Reading**: `Book`, `ReadingCycle`, `Milestone`, `ReadingProgress`
- **Community**: `DiscussionThread`, `Post`
- **Programming**: `Event`, `EventRsvp`
- **Editorial**: `News`
- **Operations**: `Notification`, `AuditLog`, `SiteSetting`

Design rules:

- Every content row that belongs to a club carries `clubId`; platform-wide news has `clubId = null`.
- Statuses are strings validated in code (`src/lib/enums.ts`), because Prisma + SQLite has no enum
  support. Moving to PostgreSQL does not require a migration of values.
- `ReadingProgress` is unique per `(cycleId, userId)` — progress is upserted, never duplicated.
- `Milestone` rows give the club a shared schedule; `ReadingCycle.status` is the state machine
  (`PLANNED → READING → FINISHED → ARCHIVED`).
- `AuditLog` records every staff mutation: actor, action, entity, entity id, optional meta.

## 4. Roles and permissions

| Role | Scope | Can do |
| --- | --- | --- |
| `SUPER_ADMIN` | platform | Everything, including platform roles, clubs, broadcasts |
| `CLUB_ADMIN` | own clubs | Review requests, manage roster, library, cycles, events, news |
| `EDITOR` | platform news | Write and publish news |
| `MEMBER` | self | Mini App: progress, discussions, RSVP, profile |

`managedClubIds()` resolves a staff member's club scope through `Membership.role ∈ {PRESIDENT,
MANAGER}`; `SUPER_ADMIN` resolves to `all`. Every admin page and server action re-checks
`canManageClub()` — hiding a link in the sidebar is never the only guard.

## 5. Authentication

Two entry points, one session:

1. **Email + password** for staff (`loginAction`). bcrypt hash, JWT in an httpOnly cookie.
2. **Telegram Mini App** (`telegramLoginAction`). `initData` is verified server-side
   (`validateInitData`), then the user is upserted by `telegramId` and a session cookie is issued.
   The client navigates to `/app` after `{ ok: true }`; the action itself never redirects, because
   it is invoked from a fetch-like client flow.

`/tg` is the only route that renders without a session and can create one from Telegram. Session
lifetime is 30 days; staff actions are audited regardless of entry point.

## 6. Bot

`src/lib/telegram.ts` is a small Bot API client (no framework) plus the `initData` validator.
`src/app/api/telegram/route.ts` handles:

- `/start` — welcome, Mini App button (HTTPS only), directory link
- `/start club_<slug>` — deep link used by club channels; returns club brief, next event, join link
- `/events` — next four published events
- `/read` — current Book Club cycle and meeting
- `/help` — command list

Registration: `npm run tg:webhook` with `NEXT_PUBLIC_SITE_URL`, `TELEGRAM_BOT_TOKEN`,
`TELEGRAM_WEBHOOK_SECRET`. The webhook is idempotent and secret-guarded; unknown text falls back
to the command hint.

**Per-club bots.** One bot per club is the target state (`@tsuebookclub_bot`,
`@tsue_debate_bot`, …). The code is bot-agnostic: each deployment sets `TELEGRAM_BOT_TOKEN` and
`DEFAULT_CLUB_SLUG`. For a single deployment serving several bots, add a `Bot` table
(`clubId`, token secret reference, webhook path `/api/telegram/[botId]`) and resolve the token from
the path — the handler body stays the same.

### 6.1 Per-club webhooks (branch `feat/per-club-bots`)

`src/lib/bot-runtime.ts` resolves a bot from the slug in the webhook path:

| Webhook | Token | Club |
| --- | --- | --- |
| `/api/telegram` | `TELEGRAM_BOT_TOKEN` | `DEFAULT_CLUB_SLUG` (book-club in Phase 1) |
| `/api/telegram/book-club` | `TELEGRAM_BOT_TOKEN_BOOK_CLUB` | `book-club` |
| `/api/telegram/debate` | `TELEGRAM_BOT_TOKEN_DEBATE` | `debate` |

`npm run tg:webhook` registers every configured bot, `npm run tg:webhook -- debate` registers one.
Secrets are per bot (`TELEGRAM_WEBHOOK_SECRET_<SLUG>` falling back to the shared secret), so a
leaked bot token can be rotated without touching the others.

## 7. Admin console

The console is organized by the jobs an officer does, not by database tables:

- **Dashboard** — pending requests, active members, upcoming events, active cycles, audit tail.
- **Join requests** — one-click approve/reject, bulk approve, per-club filter, applicant context.
- **Members** — inline role/status selects that submit on change; platform roles separately.
- **Library** — books per club with cover colours and edit dialogs.
- **Reading** — start a cycle (auto-finishes the previous one and notifies all members), add
  milestones, see readers/threads.
- **Events** — create/edit/publish; RSVP counts visible immediately.
- **News** — general or club-scoped; draft/publish; slug generated and de-duplicated.
- **Clubs** — contacts, meeting cadence, accent colour.
- **Settings** — environment readiness, broadcast, audit log.

Every mutation revalidates the public routes it affects, so the site never shows stale data after
an admin action.

## 8. Design system

Tokens live in `src/app/globals.css`: brand green `#21a04c` with deep `#0f6b39` and ink `#0b4527`,
brass `#9a7434`, warm paper `#efece3`, ink `#131d17`, clay `#a8492f`. Blue is not used anywhere. Type: Fraunces (editorial), Manrope (UI). Radii
6/10/14/20. One accent variable per club (`--club-accent`) themes buttons, badges and progress.

Covers are generated, not photographed: `CoverArt` renders deterministic SVG/CSS patterns from
the club's palette, so every page has a visual identity without external assets, image loading or
licensing questions.

Rules: no emoji anywhere in the product; no marketing filler; every card leads to an action; empty
states say what to do next.

## 9. Extending to the next club

1. Add the club row (`src/config/clubs.ts`) — slug, category, accent, contacts.
2. `npm run db:seed` — creates the club, membership seed, first events.
3. Create the bot in BotFather, set `TELEGRAM_BOT_TOKEN`, run `npm run tg:webhook`.
4. Add a `Book`/`Event` set for that club in the admin console; no code changes.
5. Optional: set `DEFAULT_CLUB_SLUG` for that deployment so `/start` opens the right club brief.

The umbrella portal picks the club up automatically: directory, filters, sitemap, footer.
