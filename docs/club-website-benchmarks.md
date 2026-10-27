# Club platforms: 20 features worth stealing

Sources reviewed: CampusGroups / Ready Education and Anthology Engage (US university student-org
platforms), Presence (campus event + attendance), Wild Apricot and ClubExpress (membership sites),
ClubHelix (club-website archetypes for sports and community clubs), connectMyClub (running-club
management), Klubraum and Pace/Heylo (club calendars, RSVPs, waitlists).

The list below is ordered by value for a TDIU club, not by how often the vendor mentions it.
Every one of the twenty is implemented; the notes record the deliberate deviation where the
obvious implementation would have been wrong for a 60-seat room or a 4 000-student campus.

| # | Feature | Seen in | Why it matters here | Status |
| --- | --- | --- | --- | --- |
| 1 | Public club page with mission, leadership, meeting time and contact | CampusGroups, ClubHelix | The first question a student has is "who runs this and when do they meet". | shipped |
| 2 | Searchable club directory with category filters and sorting | CampusGroups, Engage | 22 clubs is already more than anyone scans; filtering by day of week is how a schedule actually gets built. | shipped |
| 3 | One-tap join request routed to the club lead | Wild Apricot, CampusGroups | Applying must not need a form outside the platform. | shipped |
| 4 | Event pages with RSVP and capacity | Presence, Pace | The site announces what the channel cannot: who is coming and how many places are left. | shipped |
| 5 | Add-to-calendar per event, with a reminder | Klubraum, connectMyClub | A message scrolls away; a calendar entry with a two-hour alarm does not. | shipped |
| 6 | Subscribable ICS feed (whole platform and per club) | Klubraum | Subscribe once, receive every future event without revisiting the site. | shipped |
| 7 | Device-local saved items (no account required) | Wild Apricot (wishlist), habit of reading apps | Most visitors arrive from Telegram without an account; saving must not demand one. | shipped |
| 8 | Global search across all content types | CampusGroups (campus-wide search) | "Find that Bulgakov discussion" is the single most common failed task on a channel. | shipped |
| 9 | Reading programme with per-member progress | connectMyClub, CampusGroups (tracks) | Book Club is the pilot club; progress is the reason members return weekly. | shipped |
| 10 | Discussion threads attached to a book or club | Circle/community platforms | Conversation that stays searchable instead of scrolling away in a chat. | shipped |
| 11 | Points and a club leaderboard | CampusGroups (gamification: points, badges, leaderboards) | Recognition is the cheapest retention tool a volunteer club has. | shipped |
| 12 | Admin roster management with roles and status | CampusGroups (rosters, officer transitions) | Club leadership changes every year; the platform must survive the handover. | shipped |
| 13 | CSV export of members, requests and participants | CampusGroups (reports), ClubExpress | Club leads still hand lists to the dean's office; that is the slowest recurring manual task. | shipped |
| 14 | Admin analytics: growth and attendance trends | CampusGroups (data intelligence) | A lead should see whether interest is growing without exporting anything. | shipped |
| 15 | Attendance check-in (door list, one tap per name) | Presence, CampusGroups | Turns "RSVP" into a real record and feeds the leaderboard. The QR scanner is replaced by a door list: 30 people at a door do not want to open a camera. | shipped |
| 16 | Waitlist that promotes automatically when places free up | Pace, Klubraum, ClubExpress | Capacity is real in a 60-seat room; a waitlist is the difference between a full room and a no-show. The oldest waiter is promoted and notified the moment a place frees. | shipped |
| 17 | Recurring events (weekly club meeting) | Klubraum, Eventbrite | Clubs meet weekly; creating 30 identical events by hand is why calendars go stale. Creating one event offers "every week × 12"; every occurrence stays a real event, so RSVP, capacity and the ICS feed are unchanged. | shipped |
| 18 | Document and resource library per club | connectMyClub, ClubHelix | Bylaws, schedules, reading packs — currently scattered across Telegram files. Links are curated in the admin panel and rendered on the club page. | shipped |
| 19 | Post-event feedback and ratings | connectMyClub (event reports/reviews) | The only cheap way to learn why attendance drops in week three. One 1–5 rating per member, averaged on the event and aggregated per club. | shipped |
| 20 | Directory of people, not only clubs | CampusGroups, Engage | "Who is in the debate club" is a real question before a first meeting. Leadership is named in full, ordinary members appear as first name + surname initial — the platform does not publish a full student list to the open web. | shipped |

## What was added on top

The comparison produced features 1–20. Three further pieces came out of building them, because
the platform felt incomplete without them:

- **Notification centre** (`/app/bildirishnomalar`) — waitlist promotions, approvals and
  announcements in one list, linked from the bell with an unread count.
- **Application tracker** (`/app/arizalar`) — a three-stage stepper (yuborildi → ko‘rilmoqda →
  qaror) so an applicant can see where their request stands without messaging a lead.
- **Calendar subscription** (`/api/calendar.ics`, per club with `?club=slug`) — the recurring-meeting
  feature is only useful if the series lands in the phone's own calendar.

## What the analysis changed

Three decisions came out of the comparison rather than out of taste:

- **Calendar subscription before ticketing.** Mature campus platforms sell tickets; TDIU clubs are
  free and small. The recurring failure is that people forget, so the effort went into `.ics`
  feeds and reminders instead of checkout.
- **Bookmarks without accounts.** Membership platforms assume a logged-in member. Here most
  traffic is anonymous Telegram referral, so saving, search and calendar work signed-out and only
  RSVP, progress and discussions require an account.
- **Exports before dashboards.** A dashboard is pleasant, but the dean's office asks for a list.
  CSV export with the same permission scope as the panel was implemented first, and the analytics
  panels second.

## Sources

- Ready Education / CampusGroups — platform overview, module list, retention framing.
- Anthology Engage and Presence (StarChapter) — event registration, attendance check-in, org governance.
- ClubHelix — club website archetypes: "next event" strip, published fees, registration, maps.
- Wild Apricot, ClubExpress — membership-site essentials and the long-standing waitlist complaint.
- Klubraum, Pace, Heylo, connectMyClub — ICS subscription, recurring sessions, waitlists, attendance.
