import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { clubs } from "../src/config/clubs";

const db = new PrismaClient();

/**
 * "`hour` o'clock, `dayOffset` days from today", in Tashkent time.
 *
 * Built from UTC parts plus the fixed +5 offset so the result is the same
 * instant no matter what timezone the seeding machine is in — and so the site,
 * which prints Tashkent time, shows the hour the seed asked for.
 */
function at(dayOffset: number, hour = 18, minute = 0) {
  const now = new Date(Date.now() + 5 * 3_600_000);
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset, hour - 5, minute),
  );
}

/**
 * Absolute date, in Tashkent time.
 *
 * The reading programme is not invented: it is what the club channel
 * (@tsuebookclub) actually announced. Those dates are facts, so they are written
 * as facts and must not drift with the day the seed happens to run. Offsetting
 * from "now" is what previously moved a finished October discussion into
 * November.
 */
/** Covers live at /public/books/<slug>.jpg — one file per title in the shelf. */
export const BOOK_COVER_SLUGS: Record<string, string> = {
  "It yurak": "it-yurak",
  "Ikki eshik orasi": "ikki-eshik-orasi",
  "Dyavoliada": "dyavoliada",
  "Iqrornoma": "iqrornoma",
  "Asrga tatigulik kun": "asrga-tatigulik-kun",
  "Navoiy": "navoiy",
  "Otamdan qolgan dalalar": "otamdan-qolgan-dalalar",
  "Sayyohi hindi": "sayyohi-hindi",
  "Ufq trilogiyasi": "ufq",
  "Sarob": "sarob",
  "Yulduzli tunlar": "yulduzli-tunlar",
  "Faust": "faust",
  "Graf Monte-Kristo": "graf-monte-kristo",
  "G‘arbiy frontda o‘zgarish yo‘q": "garbiy-frontda",
};

function bookSlug(title: string) {
  return BOOK_COVER_SLUGS[title] ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function on(isoDate: string, hour: number, minute = 0) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 5, minute));
}

async function main() {
  console.log("Seeding TDIU Clubs…");

  // --- reset (dev only) -----------------------------------------------------
  await db.auditLog.deleteMany();
  await db.notification.deleteMany();
  await db.post.deleteMany();
  await db.discussionThread.deleteMany();
  await db.readingProgress.deleteMany();
  await db.milestone.deleteMany();
  await db.readingCycle.deleteMany();
  await db.book.deleteMany();
  await db.eventRsvp.deleteMany();
  await db.event.deleteMany();
  await db.news.deleteMany();
  await db.resource.deleteMany();
  await db.joinRequest.deleteMany();
  await db.membership.deleteMany();
  await db.club.deleteMany();
  await db.user.deleteMany();
  await db.siteSetting.deleteMany();

  // --- clubs ---------------------------------------------------------------
  // Logos are the clubs' own emblems, pulled from each Telegram channel and
  // stored in /public/clubs/<slug>.jpg. A club without artwork keeps the
  // typographic monogram, so the seed stays safe on a clean checkout.
  const logoFor = (slug: string) => {
    // Emblems are keyed to transparency where the source allowed it, so the
    // tile holds the mark itself and nothing else.
    for (const ext of ["png", "jpg"]) {
      const file = join(process.cwd(), "public", "clubs", `${slug}.${ext}`);
      if (existsSync(file)) return `/clubs/${slug}.${ext}`;
    }
    return null;
  };

  const clubMap = new Map<string, string>();
  for (const c of clubs) {
    const club = await db.club.create({
      data: {
        slug: c.slug,
        name: c.name,
        shortName: c.shortName,
        tagline: c.tagline,
        summary: c.summary,
        description: c.description,
        category: c.category,
        accent: c.accent,
        logoUrl: logoFor(c.slug),
        coverStyle: c.coverStyle,
        telegramUrl: c.telegramUrl,
        instagramUrl: c.instagramUrl,
        email: c.email,
        meetingDay: c.meetingDay,
        meetingTime: c.meetingTime,
        location: c.location,
        sortOrder: c.sortOrder,
      },
    });
    clubMap.set(c.slug, club.id);
  }
  const bookClubId = clubMap.get("book-club")!;

  // --- people --------------------------------------------------------------
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe!2026";
  const passwordHash = await bcrypt.hash(password, 10);

  const superAdmin = await db.user.create({
    data: {
      firstName: "Dilshod",
      lastName: "Karimov",
      email: process.env.SEED_ADMIN_EMAIL ?? "admin@clubs.tdiu.uz",
      passwordHash,
      role: "SUPER_ADMIN",
      points: 0,
    },
  });

  const president = await db.user.create({
    data: {
      firstName: "Malika",
      lastName: "Rahimova",
      email: "president.book@clubs.tdiu.uz",
      passwordHash,
      telegramId: "100000001",
      username: "malika_bookclub",
      role: "CLUB_ADMIN",
      points: 640,
    },
  });

  const editor = await db.user.create({
    data: {
      firstName: "Javohir",
      lastName: "To‘rayev",
      email: "editor.book@clubs.tdiu.uz",
      passwordHash,
      telegramId: "100000002",
      username: "javohir_edits",
      role: "EDITOR",
      points: 280,
    },
  });

  const memberSeed = [
    ["Sevinch", "Yo‘ldosheva", 520, "sevinch_y"],
    ["Bekzod", "Abduqaxorov", 480, "bekzod_a"],
    ["Nodira", "Ismoilova", 430, "nodira_i"],
    ["Aziz", "Tursunov", 390, "aziz_t"],
    ["Madina", "Mahmudjonova", 350, "madina_m"],
    ["Sardor", "Saidov", 300, "sardor_s"],
    ["Gulnoza", "Ergasheva", 260, "gulnoza_e"],
    ["Jasur", "Nematov", 210, "jasur_n"],
  ] as const;

  const members: Array<{ id: string; firstName: string; lastName: string | null }> = [];
  for (const [first, last, points, username] of memberSeed) {
    members.push(
      await db.user.create({
        data: {
          firstName: first,
          lastName: last,
          telegramId: `2${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`,
          username,
          // Demo students share the seed password so the Mini App can be shown
          // in a browser. Production accounts come from Telegram initData and
          // have no password at all.
          email: `${username}@demo.tdiu.uz`,
          passwordHash: await bcrypt.hash(password, 10),
          role: "MEMBER",
          points,
        },
      }),
    );
  }

  await db.membership.createMany({
    data: [
      { userId: president.id, clubId: bookClubId, role: "PRESIDENT", status: "ACTIVE" },
      { userId: editor.id, clubId: bookClubId, role: "MANAGER", status: "ACTIVE" },
      ...members.map((m, i) => ({
        userId: m.id,
        clubId: bookClubId,
        role: i === 0 ? "MANAGER" : "MEMBER",
        status: "ACTIVE",
      })),
      { userId: superAdmin.id, clubId: bookClubId, role: "MANAGER", status: "ACTIVE" },
    ],
  });

  // --- the rest of the network ---------------------------------------------
  // The pilot club is Book Club, but a directory where 21 of 22 clubs are empty
  // misrepresents the campus. These are the same students joining a second club
  // plus a few officers for the larger directions, so every count on the site
  // (directory, filters, leaderboard) reflects a plausible network.
  const extraPeople = [
    ["Diyora", "Rahimova", 380, "diyora_r"],
    ["Islom", "Yo‘ldoshev", 340, "islom_y"],
    ["Zarina", "Sattorova", 310, "zarina_s"],
    ["Ulug‘bek", "Mirzayev", 295, "ulugbek_m"],
    ["Kamila", "Saidova", 275, "kamila_s"],
    ["Temur", "Alimov", 240, "temur_a"],
    ["Nilufar", "Qodirova", 225, "nilufar_q"],
    ["Doniyor", "Toshmatov", 190, "doniyor_t"],
  ] as const;

  const extra: Array<{ id: string; firstName: string; lastName: string | null }> = [];
  for (const [first, last, points, username] of extraPeople) {
    extra.push(
      await db.user.create({
        data: {
          firstName: first,
          lastName: last,
          telegramId: `3${Math.floor(Math.random() * 1e8).toString().padStart(8, "0")}`,
          username,
          email: `${username}@demo.tdiu.uz`,
          passwordHash: await bcrypt.hash(password, 10),
          role: "MEMBER",
          points,
        },
      }),
    );
  }

  const network: Array<[string, number[], string | null]> = [
    // slug, member indexes from `extra`, president first name source
    ["zakovat", [0, 1, 2, 3], "Diyora"],
    ["debate", [1, 2, 4, 5], "Islom"],
    ["wikiclub", [0, 3, 6], "Zarina"],
    ["it-club", [3, 5, 7], "Ulug‘bek"],
    ["speaking", [2, 4], "Kamila"],
    ["eco-club", [5, 6, 7], "Temur"],
    ["art-club", [6, 0], "Nilufar"],
    ["handmade", [7, 1], "Doniyor"],
    ["sport", [3, 4, 5, 6], "Ulug‘bek"],
    ["cybersport", [2, 7], "Diyora"],
    ["iqtisodchilar", [1, 6], "Islom"],
    ["mushoira", [4, 5], "Kamila"],
    ["ijodkor", [0, 7], "Diyora"],
    ["networking", [2, 3], "Diyora"],
  ];

  for (const [slug, indexes, leader] of network) {
    const clubId = clubMap.get(slug);
    if (!clubId) continue;
    const roster = indexes.map((index) => extra[index]).filter(Boolean);
    if (roster.length === 0) continue;
    const lead = roster.find((person) => person.firstName === leader) ?? roster[0];
    await db.membership.createMany({
      data: roster.map((person) => ({
        userId: person.id,
        clubId,
        role: person.id === lead.id ? "PRESIDENT" : "MEMBER",
        status: "ACTIVE",
      })),
    });
  }

  // Every student is in at least one club beyond Book Club, the way a real
  // campus works: the directory should read as a network, not a roster.
  const crossClub = ["book-club", "debate", "zakovat", "speaking"];
  for (const [index, person] of members.entries()) {
    const slug = crossClub[index % crossClub.length];
    const clubId = clubMap.get(slug);
    if (!clubId || slug === "book-club") continue;
    await db.membership
      .create({ data: { userId: person.id, clubId, role: "MEMBER", status: "ACTIVE" } })
      .catch(() => null);
  }

  // --- join requests -------------------------------------------------------
  const requests = [
    ["Kamola", "Xolmatova", "Iqtisodiyot", "2", "IE-24", "+998901112233", "@kamola_x", "Bookonomics muhokamalarida qatnashmoqchiman.", "NEW"],
    ["Rustam", "Qodirov", "Buxgalteriya hisobi", "1", "BH-25", "+998935556677", "@rustam_q", "Har hafta kitob o‘qiyman, jamoa kerak.", "NEW"],
    ["Zilola", "Nurmatova", "Menejment", "3", "MN-23", "+998977778899", "@zilola_n", null, "IN_REVIEW"],
    ["Otabek", "Rasulov", "Turizm", "2", "TR-24", "+998991234567", "@otabek_r", "Sayohat va kitob — mening ikki qiziqishim.", "APPROVED"],
    ["Dildora", "Umarova", "Moliya", "4", "MF-22", "+998909876543", "@dildora_u", null, "REJECTED"],
    ["Sanjar", "Xudoyberdiyev", "IT", "1", "AT-25", "+998919998877", "@sanjar_x", "Kitobxonlik indeksiga tayyorlanmoqchiman.", "NEW"],
  ] as const;

  for (const [first, last, faculty, course, group, phone, telegram, motivation, status] of requests) {
    await db.joinRequest.create({
      data: {
        clubId: bookClubId,
        fullName: `${first} ${last}`,
        faculty,
        course,
        group,
        phone,
        telegram,
        motivation,
        status,
        createdAt: at(-Math.floor(Math.random() * 12) - 1, 12),
      },
    });
  }

  // --- library -------------------------------------------------------------
  const bookData: Array<{
    title: string;
    author: string;
    year: number;
    pages: number;
    genre: string;
    description: string;
    from: string;
    to: string;
  }> = [
    {
      title: "It yurak",
      author: "Mixail Bulgakov",
      year: 1925,
      pages: 160,
      genre: "Satira",
      description:
        "Professor Preobrajenskiyning tajribasi natijasida oddiy it inson qiyofasiga kiradi. Asar ilm, axloq va mas’uliyat chegaralari haqida.",
      from: "#1b4b31",
      to: "#4a3a1f",
    },
    {
      title: "Ikki eshik orasi",
      author: "O‘tkir Hoshimov",
      year: 1986,
      pages: 480,
      genre: "Roman",
      description:
        "Urush yillari va undan keyingi hayot, inson taqdiri va ruhiy kechinmalar haqidagi roman. TDIU Book Clubning birinchi Bookonomics soni shu asarga bag‘ishlangan.",
      from: "#6b3a2a",
      to: "#b07a4a",
    },
    {
      title: "Dyavoliada",
      author: "Mixail Bulgakov",
      year: 1925,
      pages: 96,
      genre: "Povest",
      description:
        "Byurokratiya va tartibsizlik ichida yo‘qolgan inson haqidagi grotesk povest. Navbatdagi muhokama uchun tanlangan asar.",
      from: "#9a5a42",
      to: "#9a8046",
    },
    {
      title: "Sayyohi hindi",
      author: "Fitrat",
      year: 1920,
      pages: 208,
      genre: "Sayohatnoma",
      description: "Ijtimoiy faollik indeksi ro‘yxatidagi asar: Sharq va G‘arb qiyoslari, ma’rifat g‘oyasi.",
      from: "#2f5d50",
      to: "#5e917f",
    },
    {
      title: "Navoiy",
      author: "Oybek",
      year: 1944,
      pages: 432,
      genre: "Roman",
      description: "Buyuk shoir hayoti va davri haqidagi tarixiy-biografik roman.",
      from: "#1b4b31",
      to: "#3f7a55",
    },
    {
      title: "Ufq trilogiyasi",
      author: "Said Ahmad",
      year: 1974,
      pages: 640,
      genre: "Trilogiya",
      description: "Urush davridagi insonlar taqdiri, matonat va sadoqat haqida.",
      from: "#5a3d1f",
      to: "#9a7440",
    },
    {
      title: "Yulduzli tunlar",
      author: "Pirimqul Qodirov",
      year: 1978,
      pages: 560,
      genre: "Roman",
      description: "Zahiriddin Muhammad Bobur hayoti haqidagi roman.",
      from: "#2e3a22",
      to: "#3a3226",
    },
    {
      title: "Sarob",
      author: "Abdulla Qahhor",
      year: 1937,
      pages: 320,
      genre: "Roman",
      description: "Yangi hayot qurilishi davridagi qarama-qarshiliklar haqida.",
      from: "#123b33",
      to: "#4a2a2a",
    },
    {
      title: "Otamdan qolgan dalalar",
      author: "Tog‘ay Murod",
      year: 1994,
      pages: 368,
      genre: "Roman",
      description: "Qishloq hayoti, urush va avlodlar xotirasi haqida.",
      from: "#4a3b2a",
      to: "#8a6d4a",
    },
    {
      title: "Faust",
      author: "Iogann Volfgang Gyote",
      year: 1808,
      pages: 512,
      genre: "Drama",
      description: "Bilim va vasvasa, tanlov va javobgarlik haqidagi klassik asar.",
      from: "#6b7350",
      to: "#9a7b4f",
    },
    {
      title: "Iqrornoma",
      author: "Lev Tolstoy",
      year: 1882,
      pages: 400,
      genre: "Povest",
      description: "Ichki izlanish va hayot mazmuni haqidagi e’tirof.",
      from: "#3a2f2a",
      to: "#7a5f4a",
    },
    {
      title: "Graf Monte-Kristo",
      author: "Aleksandr Dyuma",
      year: 1844,
      pages: 800,
      genre: "Sarguzasht",
      description: "Adolat, qasos va sabr haqidagi mashhur roman.",
      from: "#1b4b31",
      to: "#4a3a1f",
    },
    {
      title: "G‘arbiy frontda o‘zgarish yo‘q",
      author: "Erix Mariya Remark",
      year: 1929,
      pages: 288,
      genre: "Roman",
      description: "Urushning inson ruhiyatiga ta’siri haqida.",
      from: "#3b3b33",
      to: "#6f6f5f",
    },
    {
      title: "Asrga tatigulik kun",
      author: "Chingiz Aytmatov",
      year: 1980,
      pages: 352,
      genre: "Roman",
      description: "Xotira, yo‘qotish va insoniylik haqidagi falsafiy asar.",
      from: "#5b2f26",
      to: "#5a4a28",
    },
  ];

  const bookMap = new Map<string, string>();
  for (const b of bookData) {
    const book = await db.book.create({
      data: {
        clubId: bookClubId,
        title: b.title,
        author: b.author,
        year: b.year,
        pages: b.pages,
        genre: b.genre,
        description: b.description,
        coverUrl: `/books/${bookSlug(b.title)}.jpg`,
        coverFrom: b.from,
        coverTo: b.to,
      },
    });
    bookMap.set(b.title, book.id);
  }

  // --- reading cycles ------------------------------------------------------
  // These are not invented. Every date, room and discussion direction below comes
  // from the club's own channel (@tsuebookclub): the announcements of 2 and 14–15
  // October, and the recaps of 19–20 October. Book Club runs two programmes on
  // the same bookshelf, and the difference matters to a member:
  //
  //   Bookonomics        — one work per session, three discussion directions.
  //   Bir oyda bir kitob — the month's book, closed with a presentation.
  const cycleSeed = [
    {
      book: "Ikki eshik orasi",
      program: "Bookonomics",
      status: "FINISHED",
      startsAt: on("2026-09-12", 9),
      meetingAt: on("2026-10-03", 10),
      location: "Asosiy kampus, piknik maydonchasi",
      focus:
        "Inson taqdiri va hayot sinovlari\nQahramonlarning ruhiy kechinmalari\nUrushning inson hayotidagi izlari",
    },
    {
      book: "It yurak",
      program: "Bookonomics",
      status: "FINISHED",
      startsAt: on("2026-10-04", 9),
      meetingAt: on("2026-10-17", 13),
      location: "Asosiy kampus, 2-bino, 207-xona",
      focus:
        "Ichki kechinmalar va hissiy iztiroblar\nYurak amri (tanlov) va taqdir sinovi\nQahramonlarning ma’naviy qiyofasi",
    },
    {
      book: "Dyavoliada",
      program: "Bookonomics",
      status: "FINISHED",
      startsAt: on("2026-10-05", 9),
      meetingAt: on("2026-10-17", 14, 30),
      location: "Asosiy kampus, 7-bino, 206-xona",
      focus: "Byurokratiya va tartibsizlik\nGrotesk va satira tili\nInsonning o‘z o‘rnini yo‘qotishi",
    },
    {
      book: "Iqrornoma",
      program: "Bir oyda bir kitob",
      status: "READING",
      startsAt: on("2026-10-01", 9),
      meetingAt: on("2026-10-24", 15),
      location: "Asosiy kampus, 2-bino, 207-xona",
      focus:
        "Asar mazmuni va falsafiy qarashlar\nE’tirof janri va ichki izlanish\nHayot mazmuni haqidagi savollar",
    },
  ] as const;

  const cycleIds = new Map<string, string>();
  for (const cycle of cycleSeed) {
    const created = await db.readingCycle.create({
      data: {
        clubId: bookClubId,
        bookId: bookMap.get(cycle.book)!,
        program: cycle.program,
        status: cycle.status,
        startsAt: cycle.startsAt,
        endsAt: cycle.meetingAt,
        meetingAt: cycle.meetingAt,
        location: cycle.location,
        focus: cycle.focus,
      },
    });
    cycleIds.set(cycle.book, created.id);
  }

  const finished = { id: cycleIds.get("Ikki eshik orasi")! };
  const current = { id: cycleIds.get("Iqrornoma")! };

  await db.milestone.createMany({
    data: [
      // Bookonomics sessions are short: three stretches, then the discussion.
      { cycleId: cycleIds.get("It yurak")!, title: "I–III boblar", dueAt: on("2026-10-10", 20), sort: 1 },
      { cycleId: cycleIds.get("It yurak")!, title: "IV–VI boblar", dueAt: on("2026-10-15", 20), sort: 2 },
      { cycleId: cycleIds.get("It yurak")!, title: "Yakuniy boblar", dueAt: on("2026-10-16", 20), sort: 3 },
      { cycleId: cycleIds.get("Ikki eshik orasi")!, title: "Birinchi yarmi", dueAt: on("2026-09-24", 20), sort: 1 },
      { cycleId: cycleIds.get("Ikki eshik orasi")!, title: "Yakun", dueAt: on("2026-10-02", 20), sort: 2 },
      // The month's book closes with one presentation, not chapter deadlines.
      { cycleId: cycleIds.get("Iqrornoma")!, title: "Taqdimotga tayyorgarlik", dueAt: on("2026-10-18", 20), sort: 1 },
      { cycleId: cycleIds.get("Iqrornoma")!, title: "Taqdimot", dueAt: on("2026-10-24", 15), sort: 2 },
    ],
  });

  const progressValues = [92, 85, 78, 74, 66, 58, 45, 31];
  const monthBookPages = bookData.find((b) => b.title === "Iqrornoma")?.pages ?? 400;
  for (let i = 0; i < members.length; i++) {
    await db.readingProgress.create({
      data: {
        cycleId: current.id,
        userId: members[i].id,
        percent: progressValues[i],
        pagesRead: Math.round((monthBookPages * progressValues[i]) / 100),
      },
    });
  }
  await db.readingProgress.create({
    data: { cycleId: current.id, userId: president.id, percent: 100, pagesRead: monthBookPages },
  });

  // --- discussions ---------------------------------------------------------
  const thread1 = await db.discussionThread.create({
    data: {
      clubId: bookClubId,
      cycleId: cycleIds.get("It yurak")!,
      authorId: president.id,
      title: "“It yurak”: I–III boblar bo‘yicha fikrlar",
      body:
        "Birinchi uch bobda Preobrajenskiyning uyi va Sharikning dunyoqarashi ochiladi. Sizni eng ko‘p o‘ylantirgan sahna qaysi? Spoilerdan saqlanish uchun faqat shu boblar doirasida yozing.",
      kind: "QUESTION",
      isPinned: true,
    },
  });
  await db.post.createMany({
    data: [
      {
        threadId: thread1.id,
        authorId: members[0].id,
        body: "Muallifning it nigohi orqali odamlarni tasvirlashi juda kuchli. Ayniqsa oshxonadagi sahna — ochlik va adolat haqidagi savolni ochib beradi.",
        createdAt: at(-4, 20),
      },
      {
        threadId: thread1.id,
        authorId: members[3].id,
        body: "Preobrajenskiy o‘zini xudoga o‘xshatib ko‘rsatadigan joyi menga eng ta’sirli tuyuldi. Tajriba mas’uliyat talab qiladi.",
        createdAt: at(-3, 12),
      },
      {
        threadId: thread1.id,
        authorId: editor.id,
        body: "Eslatma: 17-oktabrdagi uchrashuvda aynan shu boblar bo‘yicha jamoaviy tahlil qilamiz. Savollaringizni shu yerga qoldiring.",
        createdAt: at(-2, 9),
      },
    ],
  });

  const thread2 = await db.discussionThread.create({
    data: {
      clubId: bookClubId,
      cycleId: cycleIds.get("Iqrornoma")!,
      authorId: members[1].id,
      title: "“Iqrornoma”ni qayerdan topsa bo‘ladi?",
      body: "Universitet kutubxonasida “Iqrornoma” ning o‘zbekcha nashri bormi? Taqdimotga qadar o‘qib ulgurish uchun elektron variant kerak.",
      kind: "QUESTION",
    },
  });
  await db.post.create({
    data: {
      threadId: thread2.id,
      authorId: president.id,
      body: "Axborot-resurs markazida 2 nusxa mavjud. Elektron variant uchun klub adminiga yozing — PDF havolasini yuboramiz.",
      createdAt: at(-1, 10),
    },
  });

  await db.discussionThread.create({
    data: {
      clubId: bookClubId,
      authorId: editor.id,
      title: "Ijtimoiy faollik indeksi: kitobxonlik mezoni qanday baholanadi?",
      body:
        "Vazirlikning 186-son buyrug‘iga ko‘ra kitobxonlik mezoni 12 ta asar asosida 40 ta test savoli bilan baholanadi. Klubda shu ro‘yxat bo‘yicha tayyorgarlik sessiyalarini boshlaymiz. Savollaringizni yozib qoldiring.",
      kind: "ANNOUNCEMENT",
      isPinned: true,
    },
  });

  // --- events --------------------------------------------------------------
  const eventData: Array<{
    club: string;
    title: string;
    description: string;
    type: string;
    startsAt: Date;
    endsAt?: Date;
    location: string;
    capacity?: number;
    from: string;
    to: string;
    status?: string;
  }> = [
    // Book Club timeline, exactly as the channel announced it (October 2026).
    {
      club: "book-club",
      title: "Bookonomics: “Ikki eshik orasi” muhokamasi",
      description:
        "Asar bo‘yicha ochiq muhokama: inson taqdiri va hayot sinovlari, qahramonlarning ruhiy kechinmalari, urushning inson hayotidagi izlari.",
      type: "meetup",
      startsAt: on("2026-10-03", 10),
      endsAt: on("2026-10-03", 12),
      location: "Asosiy kampus, piknik maydonchasi",
      capacity: 60,
      from: "#6b3a2a",
      to: "#b07a4a",
      status: "PUBLISHED",
    },
    {
      club: "book-club",
      title: "Bookonomics: “It yurak” muhokamasi",
      description:
        "Asar bo‘yicha muhokama: ichki kechinmalar, yurak amri va taqdir sinovi, qahramonlarning ma’naviy qiyofasi.",
      type: "meetup",
      startsAt: on("2026-10-17", 13),
      endsAt: on("2026-10-17", 15),
      location: "Asosiy kampus, 2-bino, 207-xona",
      capacity: 60,
      from: "#1b4b31",
      to: "#4a3a1f",
      status: "PUBLISHED",
    },
    {
      club: "book-club",
      title: "Bookonomics: “Dyavoliada” muhokamasi",
      description:
        "Rus tilidagi son: “Дьяволиада” — byurokratiya va tartibsizlik, grotesk va satira tili.",
      type: "meetup",
      startsAt: on("2026-10-17", 14, 30),
      endsAt: on("2026-10-17", 16, 30),
      location: "Asosiy kampus, 7-bino, 206-xona",
      capacity: 50,
      from: "#9a5a42",
      to: "#9a8046",
      status: "PUBLISHED",
    },
    {
      club: "book-club",
      title: "“Bir oyda bir kitob”: “Iqrornoma” taqdimoti",
      description:
        "Lev Tolstoyning “Iqrornoma” asari taqdimoti: asar mazmuni, falsafiy qarashlar va hayot haqidagi mushohazalar.",
      type: "meetup",
      startsAt: on("2026-10-24", 15),
      endsAt: on("2026-10-24", 17),
      location: "Asosiy kampus, 2-bino, 207-xona",
      capacity: 60,
      from: "#3a2f2a",
      to: "#7a5f4a",
      status: "PUBLISHED",
    },
    {
      club: "book-club",
      title: "“Yosh kitobxon” universitet bosqichi",
      description:
        "Ikki shart: “Men yoqtirgan asar” tahlili va “Eng kitobxon jamoa” bellashuvi. G‘olib jamoalar 20-oktabrda e’lon qilindi.",
      type: "contest",
      startsAt: on("2026-10-20", 10),
      endsAt: on("2026-10-20", 13),
      location: "Zakovat zali",
      capacity: 120,
      from: "#6b3a2a",
      to: "#b07a4a",
      status: "PUBLISHED",
    },
    {
      club: "book-club",
      title: "BRAINBOOK: Abdulhamid Cho‘lpon hayoti va ijodi",
      description:
        "Turizm va Iqtisodiyot fakultetlari hamkorligida o‘tkazilgan intellektual kurash. G‘olib: “Just If” jamoasi.",
      type: "contest",
      startsAt: on("2026-10-24", 13),
      endsAt: on("2026-10-24", 15),
      location: "Asosiy kampus, 7-bino, 214-xona",
      capacity: 100,
      from: "#5b2f26",
      to: "#5a4a28",
      status: "PUBLISHED",
    },
    {
      club: "zakovat",
      title: "Zakovat: 2-liga, 2-tur",
      description: "Ikkinchi liga jamoalari o‘rtasidagi navbatdagi tur. Natijalar turdan so‘ng e’lon qilinadi.",
      type: "contest",
      startsAt: at(6, 14),
      location: "Asosiy kampus, Zakovat zali",
      from: "#1b4b31",
      to: "#3f7a55",
      status: "PUBLISHED",
    },
    {
      club: "debate",
      title: "Munozara: “Sun’iy intellekt ta’limni yaxshilaydimi?”",
      description: "Ikki jamoa, ikki pozitsiya. Ro‘yxatdan o‘tish kanal orqali, ishtirokchilar soni cheklangan.",
      type: "workshop",
      startsAt: at(4, 11),
      location: "7-bino, “Faollar” zali",
      from: "#2e3a22",
      to: "#3a3226",
      status: "PUBLISHED",
    },
    {
      club: "it-club",
      title: "IDEATHON: g‘oyadan prototipgacha",
      description: "Bir kunlik intensiv: g‘oyani shakllantirish, jamoa yig‘ish va prototip taqdimoti. Noutbuk bilan kelish tavsiya etiladi.",
      type: "contest",
      startsAt: at(12, 10),
      location: "Akseleratsiya markazi",
      capacity: 80,
      from: "#123b33",
      to: "#4a2a2a",
      status: "PUBLISHED",
    },
    {
      club: "running-club",
      title: "Shanba runi: Anhor bo‘ylab",
      description: "07:45 da yig‘ilish, 07:50 da start. Masofa — 5 km, sur’at erkin. Suv va birinchi yordam ta’minlanadi.",
      type: "sport",
      startsAt: at(5, 7, 45),
      location: "Paxtakor shop oldida",
      from: "#33392b",
      to: "#58422a",
      status: "PUBLISHED",
    },
    {
      club: "travel-club",
      title: "Kichik Chimyon: 2099 m",
      description: "Bir kunlik tog‘ sayohati. Transport, gid va sug‘urta narxga kiritilgan. Klub a’zolari uchun chegirma.",
      type: "trip",
      startsAt: at(6, 7, 30),
      location: "Yig‘ilish: TDIU rektorat binosi",
      capacity: 35,
      from: "#2f5d3f",
      to: "#6b9a6f",
      status: "PUBLISHED",
    },
    {
      club: "eco-club",
      title: "Yashil kampus: daraxt ekish kuni",
      description: "Kampus hududida ko‘chat ekish va chiqindini saralash bo‘yicha amaliy seminar.",
      type: "meetup",
      startsAt: at(9, 9),
      location: "Asosiy kampus hovlisi",
      from: "#2f6b3f",
      to: "#6b9a5f",
      status: "PUBLISHED",
    },
    {
      club: "book-club",
      title: "Ochiq suhbat: kitob nashriyot bilan uchrashuv",
      description: "Nashriyot vakili bilan kitob tanlash, nashr jarayoni va tarjima haqida suhbat.",
      type: "meetup",
      startsAt: at(26, 15),
      location: "Asosiy kampus, kutubxona zali",
      capacity: 70,
      from: "#3f7a55",
      to: "#8a6a33",
      status: "PUBLISHED",
    },
  ];

  const eventIds: string[] = [];
  for (const e of eventData) {
    const event = await db.event.create({
      data: {
        clubId: clubMap.get(e.club)!,
        title: e.title,
        description: e.description,
        type: e.type,
        startsAt: e.startsAt,
        endsAt: e.endsAt,
        location: e.location,
        capacity: e.capacity,
        coverFrom: e.from,
        coverTo: e.to,
        status: e.status ?? "PUBLISHED",
      },
    });
    eventIds.push(event.id);
  }

  // RSVPs for the two book club events
  for (let i = 0; i < members.length; i++) {
    if (i % 3 === 0) continue;
    await db.eventRsvp.create({
      data: {
        eventId: eventIds[0],
        userId: members[i].id,
        status: i % 4 === 1 ? "MAYBE" : "GOING",
      },
    });
  }
  await db.eventRsvp.create({ data: { eventId: eventIds[0], userId: president.id, status: "GOING" } });

  // --- news ----------------------------------------------------------------
  const newsData = [
    {
      slug: "bookonomics-it-yurak-yakunlandi",
      title: "“It yurak” bo‘yicha Bookonomics muhokamasi yakunlandi",
      excerpt:
        "Bir oylik o‘qish yakunida talabalar asar qahramonlari va muallifning savollari atrofida ochiq suhbat o‘tkazdi.",
      body:
        "Book Clubning Bookonomics loyihasi doirasida Mixail Bulgakovning “It yurak” asari muhokama qilindi.\n\nSuhbat davomida ishtirokchilar asardagi ilm va mas’uliyat chegaralari, Preobrajenskiyning tanlovi va Sharikning taqdiri haqida fikr almashdilar. Muhokama oldindan e’lon qilingan uchta yo‘nalish bo‘yicha kichik guruhlarda davom etdi.\n\nKeyingi son uchun “Dyavoliada” tanlandi. Ro‘yxatdan o‘tish klub kanalida ochiq.",
      from: "#1b4b31",
      to: "#4a3a1f",
      publishedAt: at(-2, 18),
    },
    {
      slug: "yosh-kitobxon-universitet-bosqichi",
      title: "“Yosh kitobxon” tanloviga arizalar qabul qilinmoqda",
      excerpt:
        "Tanlov ikki shart asosida o‘tkaziladi: “Men yoqtirgan asar” tahlili va “Eng kitobxon jamoa” bellashuvi.",
      body:
        "Talaba-yoshlar o‘rtasida kitobxonlik madaniyatini targ‘ib etish maqsadida “Yosh kitobxon” tanlovi e’lon qilindi.\n\nBirinchi shart bo‘yicha tavsiya etilgan asarlar ro‘yxati klub kanalida e’lon qilingan. Ikkinchi shart — savol-javob bellashuvi bo‘lib, jamoalar 7 kishidan iborat.\n\nAriza topshirish uchun fakultet bo‘yicha Yoshlar masalalari va ma’naviy-ma’rifiy ishlar bo‘yicha dekan o‘rinbosariga murojaat qilish mumkin.",
      from: "#6b3a2a",
      to: "#b07a4a",
      publishedAt: at(-5, 11),
    },
    {
      slug: "ijtimoiy-faollik-indeksi-kitobxonlik",
      title: "Ijtimoiy faollik indeksi: kitobxonlik mezoni bo‘yicha tayyorgarlik",
      excerpt:
        "186-son buyruqqa ko‘ra kitobxonlik mezoni 40 ta test savoli va 12 ta asar asosida baholanadi.",
      body:
        "Oliy ta’lim, fan va innovatsiyalar vazirining 186-son buyrug‘iga muvofiq talabalarning “Ijtimoiy faollik indeksi” joriy etilgan.\n\nBirinchi mezon — kitobxonlik madaniyati. Talabalar 12 ta asar asosida 40 ta test savoliga javob beradi va maksimal 20 ball to‘playdi.\n\nBook Club ushbu ro‘yxatdagi asarlar bo‘yicha tizimli tayyorgarlik sessiyalarini o‘tkazadi. Jadval klub kanalida e’lon qilinadi.",
      from: "#2f5d50",
      to: "#5e917f",
      publishedAt: at(-8, 9),
    },
    {
      slug: "team-building-250-talaba",
      title: "Book Club team building: 250 dan ortiq ishtirokchi",
      excerpt:
        "Yangi o‘quv yili boshida klub jamoasi ochiq team building o‘tkazdi. Ishtirokchilar jamoaviy o‘yinlar va muhokamalarda qatnashdi.",
      body:
        "Book Club yangi o‘quv yilini ochiq team building bilan boshladi.\n\nAsosiy kampusning piknik zonasida o‘tkazilgan tadbirda 250 dan ortiq talaba qatnashdi. Ishtirokchilar jamoaviy o‘yinlar, kitob almashinuvi va tanishuv sessiyalarida ishtirok etdi.\n\nKlub har oy shunday ochiq tadbirlarni o‘tkazishni rejalashtirgan.",
      from: "#1b4b31",
      to: "#3f7a55",
      publishedAt: at(-29, 16),
    },
    {
      slug: "tdiu-the-rankings-2027",
      title: "TDIU THE World University Rankings 2027 da 651–700-o‘rinlarda",
      excerpt: "Universitet xalqaro reytingda TOP-700 oralig‘idan joy oldi.",
      body:
        "Toshkent davlat iqtisodiyot universiteti Times Higher Education World University Rankings 2027 reytingida 651–700-o‘rin oralig‘ini egalladi.\n\nBu natija universitetning ilm-fan va ta’lim sohasidagi izchil ishlarining natijasidir. Book Club jamoasi universitet jamoasini tabriklaydi.",
      from: "#2e3a22",
      to: "#5c6f3f",
      publishedAt: at(-12, 10),
    },
  ];

  for (const n of newsData) {
    await db.news.create({
      data: {
        clubId: bookClubId,
        slug: n.slug,
        title: n.title,
        excerpt: n.excerpt,
        body: n.body,
        coverFrom: n.from,
        coverTo: n.to,
        status: "PUBLISHED",
        publishedAt: n.publishedAt,
        authorId: editor.id,
      },
    });
  }

  // --- resources -----------------------------------------------------------
  // The files a club re-sends in the chat every semester. Stored as links: the
  // real assets live on Drive / Telegram, the platform keeps them findable.
  const resourceData = [
    {
      title: "Bookonomics: 2026 bahor o‘quv rejasi",
      description: "12 hafta, 4 kitob, har hafta shanba kuni",
      url: "https://docs.google.com/document/d/1bookonomics-spring",
      kind: "file",
    },
    {
      title: "Klub nizomi va a’zolik qoidalari",
      description: "Qabul, qatnashish va baholash tartibi",
      url: "https://docs.google.com/document/d/1bookclub-charter",
      kind: "guide",
    },
    {
      title: "Muhokama savollari shabloni",
      description: "Har qanday kitob uchun ishlatiladi",
      url: "https://docs.google.com/document/d/1discussion-template",
      kind: "guide",
    },
    {
      title: "Toshkent kutubxonalari xaritasi",
      description: "Kitob topish uchun tekshirilgan manzillar",
      url: "https://www.google.com/maps/d/edit?mid=tashkent-libraries",
      kind: "link",
    },
  ];

  for (const resource of resourceData) {
    await db.resource.create({ data: { ...resource, clubId: bookClubId } });
  }

  // --- notifications & audit ----------------------------------------------
  await db.notification.createMany({
    data: [
      {
        userId: president.id,
        title: "Yangi a’zolik so‘rovi",
        body: "Kamola Xolmatova Book Clubga qo‘shilish uchun ariza yubordi.",
        url: "/admin/join-requests",
      },
      {
        userId: president.id,
        title: "Uchrashuv yaqinlashmoqda",
        body: "“It yurak” muhokamasi 5 kundan keyin bo‘lib o‘tadi.",
        url: "/admin/events",
      },
    ],
  });

  await db.auditLog.createMany({
    data: [
      { actorId: editor.id, action: "news.published", entity: "News", entityId: "seed", meta: "Yosh kitobxon arizalari" },
      { actorId: president.id, action: "cycle.started", entity: "ReadingCycle", entityId: current.id, meta: "Iqrornoma" },
    ],
  });

  await db.siteSetting.createMany({
    data: [
      { key: "union.name", value: "TDIU Yoshlar ittifoqi" },
      { key: "union.telegram", value: "https://t.me/TDIU_YI" },
      { key: "site.tagline", value: "Universitet hayoti — bir platformada." },
    ],
  });

  console.log(`Done. Clubs: ${clubs.length}, users: ${members.length + extra.length + 3}, events: ${eventData.length}`);
  console.log(`Admin login: ${process.env.SEED_ADMIN_EMAIL ?? "admin@clubs.tdiu.uz"} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
