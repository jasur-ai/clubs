/**
 * Raqamli Tadqiqot — the research club, added to a database that already has
 * its network.
 *
 * The seed only runs on an empty database, so a club that joins later has to
 * arrive through a script that can safely run on every boot. This one is keyed
 * on the slug: it creates the row when it is missing and otherwise refreshes
 * the descriptive fields (it never touches memberships, events or anything the
 * club's own admins may have changed in the app).
 *
 * Content comes from the club's own announcement: pilot over 10 commercial
 * banks across six dimensions, evidence for 30 of 60 questions, 32 sources
 * checked and 6 errors corrected, D1–D6 methodology on a 0–3 scale with two
 * independent raters, open admission, no coding required, membership free.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const SLUG = "raqamli-tadqiqot";

const club = {
  slug: SLUG,
  name: "Raqamli Tadqiqot",
  shortName: "Raqamli Tadqiqot",
  tagline: "Dalil bilan o‘lchaymiz, ochiq e’lon qilamiz.",
  summary:
    "Tashkilotlarda sun’iy intellekt va raqamli xizmatlar qanday ishlayotganini dalil bilan o‘lchaydigan ilmiy-tadqiqot klubi.",
  description:
    "Raqamli Tadqiqot — TDIU talabalarining ilmiy-tadqiqot klubi. Biz tashkilotlarda sun’iy intellekt va raqamli xizmatlar qayerda va qanday ishlayotganini dalil bilan o‘lchaymiz, natijalarni esa ochiq e’lon qilamiz. Birinchi pilotda 10 ta tijorat banki 6 o‘lchov bo‘yicha baholandi: 60 ta savoldan 30 tasiga dalil topildi, 32 ta manba tekshirildi va 6 ta xato tuzatildi. Baholash D1–D6 o‘lchov yo‘nalishlari bo‘yicha 0–3 ballik tizimda olib boriladi — har bir ball manbaga bog‘langan, ishni ikki mustaqil baholovchi tekshiradi va ularning kelishuv koeffitsiyenti hisoblanadi. Klub a’zolari tadqiqot tajribasi, ilmiy nashr imkoniyati, turli fakultetlardan iliq va professional jamoa hamda sertifikat oladi. Qabul ochiq: saralash yo‘q, kod bilish shart emas, barcha fakultet va kurslar uchun, a’zolik bepul.",
  category: "academic",
  accent: "#1d5b4a",
  coverStyle: "dots",
  telegramUrl: "https://t.me/Raqamli_tadqiqot",
  websiteUrl: "https://raqamlitadqiqot.pages.dev",
  botUrl: "https://t.me/aiindeksi_bot",
  sortOrder: 22,
  isActive: true,
};

async function main() {
  const existing = await db.club.findUnique({ where: { slug: SLUG }, select: { id: true } });
  if (existing) {
    // refresh the copy, keep everything else (members, events, logo choice)
    const { slug, ...rest } = club;
    await db.club.update({ where: { slug }, data: rest });
    console.log("[raqamli-tadqiqot] updated");
    return;
  }
  const created = await db.club.create({ data: club, select: { id: true } });
  console.log(`[raqamli-tadqiqot] created ${created.id}`);
}

main()
  .catch((error) => {
    // never block a boot on an optional club
    console.error("[raqamli-tadqiqot] failed:", error?.message ?? error);
  })
  .finally(() => db.$disconnect());
