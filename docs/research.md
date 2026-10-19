# Research: how club ecosystems are built

The product decisions below come from three sources: international student-engagement platforms,
reading-community apps, and the actual working practice of TDIU clubs (Telegram-first). Each
section ends with what we adopted and what we deliberately left out of Phase 1.

## 1. University club platforms

Reviewed: CampusGroups / Presence (used by large US universities), Modern Campus Involve,
chapter-management tools (Greek life), and university club directories in the UK and EU.

What the mature products have in common:

1. **A single club directory** with categories, search and a stable club page. Students do not
   browse a news feed to find a club; they search the directory.
2. **Roles are explicit.** Member, officer, president, staff advisor, platform admin. Permissions
   are per club, not global.
3. **Membership has a lifecycle** — application, review queue, approval, roster, renewal. The
   review queue is the single most used admin screen.
4. **Events are first-class**: RSVP, capacity, check-in (often QR), attendance history, calendar
   export. Attendance is the data that proves a club is alive.
5. **Approvals and budgets** live next to content, because a club's event is also an approval
   request and an expense.
6. **Analytics exist at two levels** — club-level (members, attendance, retention) and
   platform-level (which clubs are dormant).
7. **Adoption is operational, not technical.** Published case studies (e.g. KAUST's six-week
   rollout) show the platform succeeds when registration is part of onboarding and club officers
   are trained, not when the tool merely exists.

Adopted: directory-first navigation, explicit per-club roles, the join-request queue, event RSVP
with capacity, club-level analytics, an audit log, and an admin console designed around daily
tasks rather than CRUD completeness.

Left out of Phase 1: budgeting, university SSO, QR check-in hardware (the RSVP record is kept so
check-in can be added without migration), and a native mobile app (the Telegram Mini App covers
the same ground with zero install friction).

## 2. Reading communities

Reviewed: Fable, Bookclubs, StoryGraph, Readfeed and several university book-club runbooks.

Patterns that matter for a book club:

- **Chapter-anchored discussion** keeps spoilers out. Readers pick a chapter, then talk.
- **A dated reading schedule** (start, milestones, meeting) is what keeps a club synchronized;
  without it discussion drifts.
- **Ranked-choice or poll-based book selection** removes the endless "what next" thread.
- **RSVP with reminder** is the difference between 30 and 8 attendees.
- **Progress is social**: seeing that the group is at 60% is a stronger motivator than a personal
  streak counter.
- **A question bank** for the host lowers the cost of running a good meeting.

Adopted: reading cycles with milestones and a meeting date, per-reader progress plus a community
average, chapter/bob-scoped discussion threads, RSVP, points for participation, and an
admin-side cycle launcher that notifies every member in one action.

Left out: public review feeds, star ratings, and social following — they add noise without
helping a 60-person club coordinate.

## 3. Telegram-first reality at TDIU

Observation from the 23 TSUE club channels (October 2026):

- Announcements, recruitment and event logistics all happen in Telegram channels; there is no
  website for any club.
- Posts are high-effort and inconsistent: dates and rooms sometimes conflict between posts
  (Book Club listed two different rooms/times for 17 October).
- Recruitment is a one-off Google Form whose results nobody can query later.
- Attendance is estimated from photos, not recorded.
- The Book Club already runs three programmes: weekly discussions (Bookonomics), a reading
  competition (Yosh kitobxon), and the university's Ijtimoiy faollik indeksi reading list.

Implication: the website must **mirror and extend** Telegram, not compete with it. The bot is the
front door, the Mini App is the tool, the site is the archive and the public face.

Adopted: bot deep links (`/start club_book-club`), Mini App entry at `/tg` authenticated with
Telegram `initData`, and every site page reachable from a Telegram message without a password.

## 4. Telegram Mini App engineering notes

From Telegram's documentation and the `@tma.js` / `@telegram-apps` SDK guidance:

- `initData` is signed with `HMAC_SHA256(key="WebAppData", msg=bot_token)`; the data-check string
  is the sorted `key=value` pairs joined by `\n`, excluding `hash`.
- Compare hashes with a timing-safe function and reject `auth_date` older than 24 hours.
- The Mini App must call `ready()` and `expand()`; theme colours should be set explicitly.
- Open the app from a `web_app` button so Telegram supplies `initData`.
- Keep API calls same-origin; there is no CORS negotiation inside the Telegram webview.
- Do not rely on localStorage for identity; validate on the server for every session.

Adopted: server-side validation in `src/lib/telegram.ts`, a bootstrap component that calls
`ready/expand`, a `/tg` entry route that exchanges `initData` for a normal session cookie, and
`web_app` buttons in every bot reply when the deployment is HTTPS.

## 5. Local context

- The umbrella organisation is **Yoshlar ittifoqi**; the Book Club describes itself as its
  project, with `@book_club_admin` as the contact point.
- TSUE's public site is a single-page application; there is no machine-readable club directory,
  so the club registry in `src/config/clubs.ts` is the source of truth and is verified against
  each club's Telegram channel.
- The university brand is navy blue; orange `#ff4500` appears as a secondary accent on the
  homepage. We use navy and blue as the primary system and reserve the warm accent for the Book
  Club, so the platform reads as institutional rather than as a separate brand.
- Language: Uzbek is the default for every surface; Russian and English are supported at the data
  level (`Book.language`) and can be added to the UI without schema changes.
