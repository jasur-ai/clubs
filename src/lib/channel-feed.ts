export type ChannelPost = {
  id: string;
  url: string;
  text: string;
  publishedAt: Date | null;
  photo: string | null;
};

const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{200D}\u{1F1E6}-\u{1F1FF}]/gu;

function htmlToText(html: string) {
  return html
    // custom emoji wrappers carry a text fallback inside <b>…</b>; drop them whole
    .replace(/<tg-emoji[\s\S]*?<\/tg-emoji>/g, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#33;/g, "!")
    .replace(/&#0?39;/g, "'")
    .replace(/&#[0-9]+;/g, " ")
    .replace(EMOJI, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Public preview of a Telegram channel (`t.me/s/<username>`).
 *
 * The clubs live in Telegram, so their pages mirror the channel instead of
 * asking volunteers to rewrite the same announcement twice. The feed is read
 * from Telegram's public preview, cached for ten minutes, and sanitised: custom
 * emoji are dropped so the page keeps the platform's visual language, and the
 * original post always stays one click away.
 */
export async function getChannelFeed(username: string, limit = 3): Promise<ChannelPost[]> {
  if (!/^[a-zA-Z0-9_]{4,64}$/.test(username)) return [];

  try {
    const res = await fetch(`https://t.me/s/${username}`, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; TDIUClubs/1.0)" },
      next: { revalidate: 600 },
    });
    if (!res.ok) return [];

    const html = await res.text();
    const anchors = [...html.matchAll(new RegExp(`data-post="${username}/(\\d+)"`, "g"))];
    const posts: ChannelPost[] = [];

    for (let i = anchors.length - 1; i >= 0 && posts.length < limit * 2; i--) {
      const start = anchors[i].index ?? 0;
      const end = i + 1 < anchors.length ? (anchors[i + 1].index ?? html.length) : Math.min(html.length, start + 12000);
      const block = html.slice(start, end);

      const textMatch = block.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
      const text = textMatch ? htmlToText(textMatch[1]) : "";
      if (!text) continue;

      const timeMatch = block.match(/<time datetime="([^"]+)"/);
      const photoMatch =
        block.match(/tgme_widget_message_photo_wrap[^"]*"[^>]*background-image:url\('([^']+)'\)/) ??
        block.match(/tgme_widget_message_photo_wrap[^"]*"[^>]*href="([^"]+)"/);

      posts.push({
        id: anchors[i][1],
        url: `https://t.me/${username}/${anchors[i][1]}`,
        text: text.length > 420 ? `${text.slice(0, 417).trimEnd()}…` : text,
        publishedAt: timeMatch ? new Date(timeMatch[1]) : null,
        photo: photoMatch ? photoMatch[1].replace(/^\/\//, "https://") : null,
      });
    }

    return posts.slice(0, limit);
  } catch {
    return [];
  }
}

/** Last path segment of a t.me URL, used as the channel handle. */
export function channelUsername(url: string | null | undefined) {
  if (!url) return null;
  const handle = url.replace(/\/+$/, "").split("/").pop();
  return handle && /^[a-zA-Z0-9_]{4,64}$/.test(handle) ? handle : null;
}
