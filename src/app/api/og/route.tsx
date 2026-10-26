import { ImageResponse } from "next/og";

export const runtime = "nodejs";

/**
 * Open Graph card for clubs, events and news.
 *
 * Telegram is the main distribution channel, and a link without a preview reads
 * as a spam message. One route renders every card in the same identity: deep
 * green field, the concentric arcs from the site backdrop, and the title.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "TDIU Clubs").slice(0, 110);
  const eyebrow = (searchParams.get("eyebrow") ?? "TDIU · Yoshlar ittifoqi").slice(0, 48);
  const meta = (searchParams.get("meta") ?? "22 klub · bitta platforma").slice(0, 64);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0c1a12 0%, #0f2a1a 58%, #0b4527 100%)",
          color: "#eef1ea",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* contour arcs, same sweep as the site backdrop */}
        <div style={{ position: "absolute", right: -180, top: -120, width: 760, height: 760, borderRadius: 999, border: "2px solid rgba(33,160,76,0.28)" }} />
        <div style={{ position: "absolute", right: -80, top: -20, width: 620, height: 620, borderRadius: 999, border: "1.5px solid rgba(33,160,76,0.2)" }} />
        <div style={{ position: "absolute", right: 40, top: 100, width: 460, height: 460, borderRadius: 999, border: "1px solid rgba(238,241,234,0.12)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", width: 46, height: 46, borderRadius: 12, background: "linear-gradient(135deg,#21a04c,#0f6b39)" }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.5 }}>TDIU Clubs</span>
            <span style={{ fontSize: 15, letterSpacing: 3, color: "rgba(238,241,234,0.55)", textTransform: "uppercase" }}>
              Yoshlar ittifoqi
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 900 }}>
          <span style={{ fontSize: 17, letterSpacing: 3.4, textTransform: "uppercase", color: "#7fd3a0" }}>{eyebrow}</span>
          <span
            style={{
              fontSize: title.length > 64 ? 58 : 72,
              lineHeight: 1.08,
              fontWeight: 700,
              letterSpacing: -1.6,
              display: "flex",
            }}
          >
            {title}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 19, color: "rgba(238,241,234,0.68)" }}>
          <span>{meta}</span>
          <span style={{ color: "#c9a768" }}>tsue-clubs.onrender.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
