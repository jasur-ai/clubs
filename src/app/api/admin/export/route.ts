import { db } from "@/lib/db";
import { getSession, isAdminRole, managedClubIds } from "@/lib/auth";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * CSV export for club administrators.
 *
 * Admins currently copy names out of the screen into a spreadsheet by hand —
 * that is the single slowest routine task in the panel. Everything exported here
 * is already visible to the same admin in the UI; the route only adds a file.
 */

type Cell = string | number | null | undefined;

function csv(rows: Cell[][]) {
  const escape = (value: Cell) => {
    const text = value === null || value === undefined ? "" : String(value);
    return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  // BOM keeps Uzbek apostrophes readable when the file opens in Excel.
  return `\uFEFF${rows.map((row) => row.map(escape).join(",")).join("\r\n")}\r\n`;
}

function file(body: string, name: string) {
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${name}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  const user = await getSession();
  if (!user || !isAdminRole(user.role)) return new Response("Ruxsat yo‘q", { status: 403 });

  const url = new URL(request.url);
  const type = url.searchParams.get("type") ?? "members";
  const slug = url.searchParams.get("club");
  const scope = await managedClubIds(user);

  const clubFilter = (clubId: string) => scope === "all" || scope.includes(clubId);
  const clubs = await db.club.findMany({
    where: slug ? { slug } : {},
    select: { id: true, name: true, slug: true },
  });
  const clubIds = clubs.filter((club) => clubFilter(club.id)).map((club) => club.id);

  if (clubIds.length === 0) return new Response("Klub topilmadi", { status: 404 });
  const clubName = new Map(clubs.map((club) => [club.id, club.name]));
  const suffix = clubs.length === 1 ? clubs[0].slug : "barcha-klublar";

  if (type === "join") {
    const requests = await db.joinRequest.findMany({
      where: { clubId: { in: clubIds } },
      orderBy: { createdAt: "desc" },
      include: { club: { select: { name: true } } },
    });
    const body = csv([
      ["Sana", "Klub", "F.I.Sh.", "Fakultet", "Kurs", "Guruh", "Telefon", "Telegram", "Holat", "Motivatsiya"],
      ...requests.map((row) => [
        formatDate(row.createdAt, "dd.MM.yyyy HH:mm"),
        row.club.name,
        row.fullName,
        row.faculty,
        row.course,
        row.group,
        row.phone,
        row.telegram,
        row.status,
        row.motivation,
      ]),
    ]);
    return file(body, `arizalar-${suffix}.csv`);
  }

  if (type === "rsvps") {
    const events = await db.event.findMany({
      where: { clubId: { in: clubIds } },
      orderBy: { startsAt: "desc" },
      include: { rsvps: { include: { user: { select: { firstName: true, lastName: true, email: true, telegramId: true } } } } },
    });
    const body = csv([
      ["Tadbir", "Boshlanish", "Joy", "Ishtirokchi", "Email", "Telegram ID", "Ro‘yxatdan o‘tgan"],
      ...events.flatMap((event) =>
        event.rsvps.map((rsvp) => [
          event.title,
          formatDate(event.startsAt, "dd.MM.yyyy HH:mm"),
          event.location,
          `${rsvp.user.firstName} ${rsvp.user.lastName ?? ""}`.trim(),
          rsvp.user.email,
          rsvp.user.telegramId,
          formatDate(rsvp.createdAt, "dd.MM.yyyy HH:mm"),
        ]),
      ),
    ]);
    return file(body, `ishtirokchilar-${suffix}.csv`);
  }

  if (type === "members") {
    const memberships = await db.membership.findMany({
      where: { clubId: { in: clubIds } },
      orderBy: [{ clubId: "asc" }, { joinedAt: "asc" }],
      include: { user: { select: { firstName: true, lastName: true, email: true, telegramId: true, points: true } } },
    });
    const body = csv([
      ["Klub", "F.I.Sh.", "Email", "Telegram ID", "Rol", "Holat", "Qo‘shilgan", "Ball"],
      ...memberships.map((row) => [
        clubName.get(row.clubId) ?? "",
        `${row.user.firstName} ${row.user.lastName ?? ""}`.trim(),
        row.user.email,
        row.user.telegramId,
        row.role,
        row.status,
        formatDate(row.joinedAt, "dd.MM.yyyy"),
        row.user.points,
      ]),
    ]);
    return file(body, `azolar-${suffix}.csv`);
  }

  return new Response("Noma’lum tur", { status: 400 });
}
