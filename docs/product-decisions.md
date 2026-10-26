# Why the site exists next to the Telegram channel

Every TDIU club already publishes on Telegram. A platform that only republishes those posts adds a
second inbox and no new value, so the umbrella site is judged on one question:

> What can a student or a club lead do here that the channel cannot do?

## What a channel is genuinely good at

- Reach: it lands on the phone without anyone opening a browser.
- Speed: a club lead posts in twenty seconds, no editorial process.
- Conversation: replies, reactions and forwarded posts live with the audience.

Nothing here competes with that. The bot keeps posting every public announcement to the channel;
the site assumes the channel is where people first hear about an event.

## What a channel cannot do

| Need | Channel | Umbrella site |
| --- | --- | --- |
| Find "that Bulgakov discussion" from two months ago | Scroll and hope, search is per-chat and weak | `/qidiruv` and the ⌘K palette across clubs, books, events, news |
| Keep an event after the message scrolls away | Star the post, then lose it | `.ics` download with a two-hour reminder |
| Remember three clubs and one book for later | No concept of it | `/saqlangan`, device-local, no account |
| Compare clubs before joining | Read 21 pinned messages | Directory with category, meeting day, location, member counts |
| See the reading list and progress in one place | Pinned message drifts out of date | Library plus member reading programme |
| Hand a list of participants to a dean's office | Copy names by hand | Admin CSV export for members, requests, RSVPs |

That asymmetry is the design brief: **the channel announces, the site is where you look something
up, keep it, and act on it.** Each round-4 addition targets a task that starts after the
announcement.

## What was built in round 4

1. **Unified search** (`/api/search`, `/qidiruv`, ⌘K palette). One field over four content types,
   Uzbek apostrophes normalised, recent queries remembered locally. A student who remembers a title
   but not the section finds it in two keystrokes.
2. **Calendar export** (`/api/events/[id]/ics`, `/api/events/ics?ids=`). A single event or a whole
   shortlist, with `VALARM` two hours before, so the reminder lives in the phone calendar rather
   than in an app nobody reopens.
3. **Saved pages** (`/saqlangan`). Bookmarks without an account — the majority of visitors arrive
   from Telegram and should not be asked to register to keep a link. Synchronised across the header
   badge, save buttons and palette.
4. **Admin CSV export** (`/api/admin/export`). Members, join requests and event participants,
   scoped by the same permission model as the panel, UTF-8 BOM so Excel opens it correctly. This is
   the slowest recurring manual task for club leads.

## Deliberately not built

- **A second feed.** The landing page shows the next events and the latest news, not a mirror of the
  channel. Duplicating posts would make both surfaces worse.
- **Registration walls.** Bookmarks, search and calendar work anonymously; the account is only
  needed for RSVP, reading progress and discussions.
- **Push notifications from the site.** The bot already owns notifications; competing with it would
  train students to mute the one channel that matters.

## Consequence for the next rounds

Content should keep flowing through the bot, and the site should keep absorbing the tasks the
channel cannot hold: personal schedules, club comparison, and the paperwork admins do after an
event. New features are evaluated against that list before they are designed.
