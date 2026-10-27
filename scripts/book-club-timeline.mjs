/**
 * Book Club — the real channel timeline.
 *
 * The seed was written before the club announced its October programme, so it
 * guessed: a discussion dated a week into the future, a "next book" that had
 * already been discussed on the same day as the current one, and no trace of
 * the month book at all. The club's own channel (@tsuebookclub) is the record:
 *
 *   03.10  Bookonomics · Ikki eshik orasi   10:00  piknik maydonchasi
 *   17.10  Bookonomics · It yurak           13:00  2-bino, 207
 *   17.10  Bookonomics · Дьяволиада         14:30  7-bino, 206
 *   20.10  "Yosh kitobxon" universitet bosqichi
 *   24.10  Bir oyda bir kitob · Iqrornoma   15:00  2-bino, 207
 *   24.10  BRAINBOOK · Cho'lpon             13:00  7-bino, 214
 *
 * This script reconciles an existing database with that record and is safe to
 * run on every boot: it acts only on rows that are demonstrably wrong (a
 * November date for a talk that happened in October, a cycle still marked as
 * being read after its meeting) and creates nothing that already exists.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

/** Absolute Tashkent time → instant (Uzbekistan is UTC+5, no DST). */
const at = (isoDay, hour, minute = 0) => {
  const [y, m, d] = isoDay.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hour - 5, minute));
};

const MEETINGS = [
  { book: "Ikki eshik orasi", start: at("2026-10-03", 10), end: at("2026-10-03", 12), room: "Asosiy kampus, piknik maydonchasi" },
  { book: "It yurak", start: at("2026-10-17", 13), end: at("2026-10-17", 15), room: "Asosiy kampus, 2-bino, 207-xona" },
  { book: "Dyavoliada", start: at("2026-10-17", 14, 30), end: at("2026-10-17", 16, 30), room: "Asosiy kampus, 7-bino, 206-xona" },
];

const MONTH_BOOK = {
  book: "Iqrornoma",
  program: "Bir oyda bir kitob",
  start: at("2026-10-01", 9),
  meeting: at("2026-10-24", 15),
  room: "Asosiy kampus, 2-bino, 207-xona",
  focus: "Asar mazmuni va falsafiy qarashlar\nE'tirof janri va ichki izlanish\nHayot mazmuni haqidagi savollar",
};

async function main() {
  const club = await db.club.findUnique({ where: { slug: "book-club" }, select: { id: true } });
  if (!club) {
    console.log("[book-club] club not found, skipping");
    return;
  }

  const books = await db.book.findMany({ where: { clubId: club.id }, select: { id: true, title: true } });
  const bookId = (title) => books.find((book) => book.title === title)?.id ?? null;

  let fixedEvents = 0;
  let fixedCycles = 0;

  // The club runs two reading programmes, not one. A description written when
  // only Bookonomics existed still says so on the club page; fix that sentence
  // and nothing else.
  const clubRow = await db.club.findUnique({ where: { id: club.id }, select: { description: true } });
  const stalePhrase = "Bookonomics loyihasi, “Yosh kitobxon” tanlovi";
  if (clubRow?.description?.includes(stalePhrase)) {
    await db.club.update({
      where: { id: club.id },
      data: {
        description: clubRow.description.replace(
          stalePhrase,
          "Bookonomics va “Bir oyda bir kitob” dasturlari, “Yosh kitobxon” tanlovi",
        ),
      },
    });
    console.log("[book-club] description now names both reading programmes");
  }

  // --- covers ---------------------------------------------------------------
  // A library row without the publisher's artwork is a placeholder, and a page
  // full of coloured rectangles looks exactly like what it is. Fill in the
  // cover for every title that has one, and only touch rows that lack it.
  const COVERS = {
    "It yurak": "it-yurak",
    "Ikki eshik orasi": "ikki-eshik-orasi",
    Dyavoliada: "dyavoliada",
    Iqrornoma: "iqrornoma",
    "Asrga tatigulik kun": "asrga-tatigulik-kun",
    Navoiy: "navoiy",
    "Otamdan qolgan dalalar": "otamdan-qolgan-dalalar",
    "Sayyohi hindi": "sayyohi-hindi",
    "Ufq trilogiyasi": "ufq",
    Sarob: "sarob",
    "Yulduzli tunlar": "yulduzli-tunlar",
    Faust: "faust",
    "Graf Monte-Kristo": "graf-monte-kristo",
    "G‘arbiy frontda o‘zgarish yo‘q": "garbiy-frontda",
  };
  let covered = 0;
  for (const [title, slug] of Object.entries(COVERS)) {
    const book = await db.book.findFirst({ where: { title }, select: { id: true, coverUrl: true } });
    if (!book) continue;
    const url = `/books/${slug}.jpg`;
    if (book.coverUrl !== url) {
      await db.book.update({ where: { id: book.id }, data: { coverUrl: url } });
      covered += 1;
    }
  }
  if (covered) console.log(`[book-club] ${covered} cover(s) attached`);

  // --- events ---------------------------------------------------------------
  for (const meeting of MEETINGS) {
    const id = bookId(meeting.book);
    if (!id) continue;
    const title = `Bookonomics: “${meeting.book}” muhokamasi`;
    const existing = await db.event.findFirst({
      where: { clubId: club.id, title },
      select: { id: true, startsAt: true, endsAt: true, location: true },
    });
    if (!existing) {
      // The discussion happened; a database that has no row for it is simply
      // missing the record, and the page then claims the club never met.
      await db.event.create({
        data: {
          clubId: club.id,
          title,
          description: `“${meeting.book}” asari bo‘yicha ochiq muhokama.`,
          type: "meetup",
          startsAt: meeting.start,
          endsAt: meeting.end,
          location: meeting.room,
          capacity: 60,
          status: "PUBLISHED",
        },
      });
      fixedEvents += 1;
      continue;
    }
    const late =
      existing.startsAt.getTime() !== meeting.start.getTime() ||
      existing.endsAt?.getTime() !== meeting.end.getTime() ||
      existing.location !== meeting.room;
    if (late) {
      await db.event.update({
        where: { id: existing.id },
        data: { startsAt: meeting.start, endsAt: meeting.end, location: meeting.room },
      });
      fixedEvents += 1;
    }
  }

  // An older database may still advertise a "next session" for a book that has
  // already been discussed — a leftover from dates that were guessed relative
  // to the seeding date. It is not a plan, it is a duplicate: retire it rather
  // than delete it, so an organiser can still see and republish the row.
  const now = new Date();
  for (const meeting of MEETINGS) {
    const stale = await db.event.findMany({
      where: {
        clubId: club.id,
        status: "PUBLISHED",
        startsAt: { gt: now },
        title: { contains: meeting.book },
      },
      select: { id: true, title: true },
    });
    for (const event of stale) {
      if (!/Bookonomics/i.test(event.title)) continue;
      await db.event.update({ where: { id: event.id }, data: { status: "CANCELLED" } });
      console.log(`[book-club] retired stale event: ${event.title}`);
      fixedEvents += 1;
    }
  }

  // The month book's presentation: create once, only if the club has no event
  // mentioning it at all — an organiser may have written it by hand already.
  const monthTitle = "“Bir oyda bir kitob”: “Iqrornoma” taqdimoti";
  const monthEvent = await db.event.findFirst({ where: { clubId: club.id, title: { contains: "Iqrornoma" } } });
  if (!monthEvent) {
    await db.event.create({
      data: {
        clubId: club.id,
        title: monthTitle,
        description:
          "Lev Tolstoyning “Iqrornoma” asari taqdimoti: asar mazmuni, falsafiy qarashlar va hayot haqidagi mushohazalar.",
        type: "meetup",
        startsAt: MONTH_BOOK.meeting,
        endsAt: at("2026-10-24", 17),
        location: MONTH_BOOK.room,
        capacity: 60,
        coverFrom: "#3a2f2a",
        coverTo: "#7a5f4a",
        status: "PUBLISHED",
      },
    });
    fixedEvents += 1;
  }

  // --- reading cycles -------------------------------------------------------
  for (const meeting of MEETINGS) {
    const id = bookId(meeting.book);
    if (!id) continue;
    const cycle = await db.readingCycle.findFirst({ where: { clubId: club.id, bookId: id }, orderBy: { createdAt: "asc" } });
    if (!cycle) continue;
    const stale =
      cycle.status !== "FINISHED" ||
      cycle.meetingAt?.getTime() !== meeting.start.getTime() ||
      cycle.location !== meeting.room;
    if (stale) {
      await db.readingCycle.update({
        where: { id: cycle.id },
        data: {
          status: "FINISHED",
          program: "Bookonomics",
          startsAt: new Date(meeting.start.getTime() - 13 * 86_400_000),
          endsAt: meeting.start,
          meetingAt: meeting.start,
          location: meeting.room,
        },
      });
      fixedCycles += 1;
    }
  }

  const monthBookId = bookId(MONTH_BOOK.book);
  if (monthBookId) {
    let cycle = await db.readingCycle.findFirst({ where: { clubId: club.id, bookId: monthBookId } });
    if (!cycle) {
      cycle = await db.readingCycle.create({
        data: {
          clubId: club.id,
          bookId: monthBookId,
          program: MONTH_BOOK.program,
          status: "READING",
          startsAt: MONTH_BOOK.start,
          endsAt: MONTH_BOOK.meeting,
          meetingAt: MONTH_BOOK.meeting,
          location: MONTH_BOOK.room,
          focus: MONTH_BOOK.focus,
        },
      });
      fixedCycles += 1;
    } else if (cycle.program !== MONTH_BOOK.program) {
      await db.readingCycle.update({ where: { id: cycle.id }, data: { program: MONTH_BOOK.program } });
    }

    const milestones = await db.milestone.count({ where: { cycleId: cycle.id } });
    if (milestones === 0) {
      await db.milestone.createMany({
        data: [
          { cycleId: cycle.id, title: "Taqdimotga tayyorgarlik", dueAt: at("2026-10-18", 20), sort: 1 },
          { cycleId: cycle.id, title: "Taqdimot", dueAt: MONTH_BOOK.meeting, sort: 2 },
        ],
      });
    }

    // A cycle with no readers shows "0%" on the home page and reads as dead.
    const readers = await db.readingProgress.count({ where: { cycleId: cycle.id } });
    if (readers === 0) {
      const members = await db.membership.findMany({
        where: { clubId: club.id, status: "ACTIVE" },
        take: 8,
        select: { userId: true },
      });
      const pages = (await db.book.findUnique({ where: { id: monthBookId }, select: { pages: true } }))?.pages ?? 400;
      const percents = [74, 66, 58, 52, 45, 38, 26, 16];
      await db.readingProgress.createMany({
        data: members.map((member, index) => ({
          cycleId: cycle.id,
          userId: member.userId,
          percent: percents[index] ?? 10,
          pagesRead: Math.round((pages * (percents[index] ?? 10)) / 100),
        })),
      });
    }
  }

  console.log(`[book-club] timeline reconciled — ${fixedEvents} event(s), ${fixedCycles} cycle(s)`);
}

main()
  .catch((error) => {
    // A demo top-up must never block a deploy.
    console.error("[book-club] skipped:", error?.message ?? error);
  })
  .finally(async () => {
    await db.$disconnect();
  });
