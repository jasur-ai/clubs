import "server-only";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, db: true, ts: new Date().toISOString() });
  } catch {
    return NextResponse.json({ ok: false, db: false }, { status: 503 });
  }
}
