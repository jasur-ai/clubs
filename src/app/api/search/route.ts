import { NextResponse } from "next/server";
import { searchAll } from "@/lib/search";

export const dynamic = "force-dynamic";

/**
 * Typeahead feed for the command palette. The full result set lives at /qidiruv,
 * which this same helper renders server-side.
 */
export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get("q") ?? "").trim();
  const hits = await searchAll(q, 5);
  return NextResponse.json({ q, hits });
}
