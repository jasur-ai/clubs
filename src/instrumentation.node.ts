/**
 * Runs once when the Node server boots. On a public HTTPS deployment the
 * Telegram webhook and the Mini App menu button are registered automatically,
 * so a fresh deploy is reachable in Telegram without running a script by hand.
 * Every call is idempotent and failures are logged, never fatal.
 */
export async function register() {
  // Presentation data (accents, emblem paths, cover colours) is derived from
  // the repository, not hand-managed in the database. Reconcile it on boot so a
  // deploy can never ship a page that still points at the old palette.
  if (process.env.SKIP_PALETTE_SYNC !== "1") {
    try {
      const { syncPalette } = await import("@/lib/palette-sync");
      const changed = await syncPalette();
      // A palette change invalidates anything Next prerendered with the old
      // values; drop those entries so the first visitor can't receive stale
      // markup that then mismatches on hydration.
      if (changed > 0) {
        const { revalidatePath } = await import("next/cache");
        revalidatePath("/", "layout");
      }
    } catch (error) {
      console.error("[palette] sync failed", error);
    }
  }

  if (process.env.DISABLE_TELEGRAM_BOOTSTRAP === "1") return;

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (!token || !site.startsWith("https://")) return;

  const { createTelegramClient } = await import("@/lib/telegram");
  const { resolveBot } = await import("@/lib/bot-runtime");
  const tg = createTelegramClient(token);
  const bot = resolveBot();

  try {
    await tg.setWebhook(`${site}/api/telegram`, bot?.webhookSecret);
    await tg.setChatMenuButton(`${site}/tg`, "Ilova");
    console.log(`[telegram] webhook registered for ${site}`);
  } catch (error) {
    console.error("[telegram] bootstrap failed", error);
  }
}
