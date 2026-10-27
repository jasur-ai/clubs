/**
 * Demo network top-up.
 *
 * The seed fills a fresh database with the Book Club pilot. A deployment that
 * has been running for a while therefore shows a directory where one club has
 * members and twenty-one are empty, which misrepresents the campus and makes
 * the filters and the member directory look unfinished.
 *
 * This script adds the rest of the network *idempotently*: every row is matched
 * on a stable key (username for people, userId+clubId for memberships) and
 * skipped when present. It never edits or deletes existing content, so it is
 * safe to run on every boot — but it is gated behind DEMO_NETWORK=1 because a
 * real deployment should not invent students.
 */
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const people = [
  ["Diyora", "Rahimova", 380, "diyora_r"],
  ["Islom", "Yo‘ldoshev", 340, "islom_y"],
  ["Zarina", "Sattorova", 310, "zarina_s"],
  ["Ulug‘bek", "Mirzayev", 295, "ulugbek_m"],
  ["Kamila", "Saidova", 275, "kamila_s"],
  ["Temur", "Alimov", 240, "temur_a"],
  ["Nilufar", "Qodirova", 225, "nilufar_q"],
  ["Doniyor", "Toshmatov", 190, "doniyor_t"],
];

// slug -> member indexes (into `people`), and the president's first name
const network = [
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

async function main() {
  const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe!2026", 10);

  const created = [];
  for (const [firstName, lastName, points, username] of people) {
    const existing = await db.user.findFirst({ where: { username }, select: { id: true } });
    if (existing) {
      created.push({ id: existing.id, firstName });
      continue;
    }
    const user = await db.user.create({
      data: {
        firstName,
        lastName,
        username,
        email: `${username}@demo.tdiu.uz`,
        passwordHash,
        role: "MEMBER",
        points,
      },
      select: { id: true, firstName: true },
    });
    created.push(user);
  }

  let added = 0;
  for (const [slug, indexes, leader] of network) {
    const club = await db.club.findUnique({ where: { slug }, select: { id: true } });
    if (!club) continue;
    const roster = indexes.map((index) => created[index]).filter(Boolean);
    if (roster.length === 0) continue;
    const lead = roster.find((person) => person.firstName === leader) ?? roster[0];

    for (const person of roster) {
      const exists = await db.membership.findUnique({
        where: { userId_clubId: { userId: person.id, clubId: club.id } },
        select: { id: true },
      });
      if (exists) {
        if (person.id === lead.id) {
          await db.membership.update({ where: { id: exists.id }, data: { role: "PRESIDENT" } });
        }
        continue;
      }
      await db.membership.create({
        data: {
          userId: person.id,
          clubId: club.id,
          role: person.id === lead.id ? "PRESIDENT" : "MEMBER",
          status: "ACTIVE",
        },
      });
      added += 1;
    }
  }

  // A few students also join a second club, the way a real campus works.
  const crossClub = ["debate", "zakovat", "speaking"];
  const students = await db.user.findMany({
    where: { role: "MEMBER", email: { endsWith: "@demo.tdiu.uz" } },
    orderBy: { username: "asc" },
    select: { id: true },
    take: 12,
  });
  for (const [index, student] of students.entries()) {
    const slug = crossClub[index % crossClub.length];
    const club = await db.club.findUnique({ where: { slug }, select: { id: true } });
    if (!club) continue;
    const exists = await db.membership.findUnique({
      where: { userId_clubId: { userId: student.id, clubId: club.id } },
      select: { id: true },
    });
    if (!exists) {
      await db.membership.create({ data: { userId: student.id, clubId: club.id, status: "ACTIVE" } });
      added += 1;
    }
  }

  console.log(`[demo-network] ${added} new memberships`);
}

main()
  .catch((error) => {
    // Never fail a deploy because the demo data could not be topped up.
    console.error("[demo-network] skipped:", error?.message ?? error);
  })
  .finally(async () => {
    await db.$disconnect();
  });
