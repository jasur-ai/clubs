"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { validateInitData } from "@/lib/telegram";

export type AuthState = { error?: string; ok?: boolean };

const credentials = z.object({
  email: z.string().email("To‘g‘ri email kiriting"),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat"),
});

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = credentials.safeParse({
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    password: String(formData.get("password") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Ma’lumotlar to‘liq emas" };
  }

  const user = await db.user.findUnique({ where: { email: parsed.data.email } });
  if (!user?.passwordHash) return { error: "Email yoki parol xato" };

  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return { error: "Email yoki parol xato" };

  await createSession(user.id);
  redirect(safeNext(formData.get("next"), user.role));
}

/** Development-only shortcut so reviewers can explore both roles without Telegram. */
export async function demoLoginAction(formData: FormData) {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_DEMO_LOGIN !== "1") {
    throw new Error("Demo login is disabled in production");
  }
  const email = String(formData.get("email") ?? "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user) throw new Error("Demo user not found — run `npm run db:seed`");
  await createSession(user.id);
  redirect(safeNext(formData.get("next"), user.role));
}

function safeNext(raw: FormDataEntryValue | null, role: string) {
  const value = typeof raw === "string" ? raw : "";
  if (value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/login")) return value;
  return role === "MEMBER" ? "/app" : "/admin";
}

export async function telegramLoginAction(rawInitData: string): Promise<AuthState> {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? "";
  const result = validateInitData(rawInitData, token);
  if (!result.ok || !result.data.user) {
    return { error: result.ok ? "Telegram foydalanuvchisi topilmadi" : result.error };
  }

  const tg = result.data.user;
  const telegramId = String(tg.id);
  const displayName = [tg.first_name, tg.last_name].filter(Boolean).join(" ");

  const user = await db.user.upsert({
    where: { telegramId },
    update: {
      firstName: tg.first_name,
      lastName: tg.last_name ?? null,
      username: tg.username ?? null,
      photoUrl: tg.photo_url ?? null,
    },
    create: {
      telegramId,
      firstName: tg.first_name,
      lastName: tg.last_name ?? null,
      username: tg.username ?? null,
      photoUrl: tg.photo_url ?? null,
      role: "MEMBER",
    },
  });

  await createSession(user.id);
  return { ok: true };
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}
