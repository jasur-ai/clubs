import "server-only";

import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Role } from "@/lib/enums";
import { db } from "@/lib/db";

const COOKIE_NAME = "tdiu_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 24) {
    throw new Error("AUTH_SECRET is missing or too short. Generate one with: openssl rand -base64 48");
  }
  return new TextEncoder().encode(value);
}

export type SessionUser = {
  id: string;
  role: Role;
  firstName: string;
  lastName: string | null;
  username: string | null;
  photoUrl: string | null;
  email: string | null;
  points: number;
};

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secret());
    const userId = payload.sub;
    if (!userId) return null;

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        firstName: true,
        lastName: true,
        username: true,
        photoUrl: true,
        email: true,
        points: true,
      },
    });
    return user ? { ...user, role: user.role as Role } : null;
  } catch {
    return null;
  }
}

export function isAdminRole(role?: Role | null) {
  return role === "SUPER_ADMIN" || role === "CLUB_ADMIN" || role === "EDITOR";
}

export async function requireUser() {
  const user = await getSession();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireAdmin() {
  const user = await getSession();
  if (!user || !isAdminRole(user.role)) throw new Error("FORBIDDEN");
  return user;
}

/** Clubs an admin can manage. SUPER_ADMIN sees everything. */
export async function managedClubIds(user: SessionUser): Promise<string[] | "all"> {
  if (user.role === "SUPER_ADMIN") return "all";
  const memberships = await db.membership.findMany({
    where: { userId: user.id, role: { in: ["PRESIDENT", "MANAGER"] }, status: "ACTIVE" },
    select: { clubId: true },
  });
  return memberships.map((m) => m.clubId);
}

export async function canManageClub(user: SessionUser, clubId: string) {
  if (user.role === "SUPER_ADMIN") return true;
  if (!isAdminRole(user.role)) return false;
  const membership = await db.membership.findFirst({
    where: { userId: user.id, clubId, role: { in: ["PRESIDENT", "MANAGER"] }, status: "ACTIVE" },
    select: { id: true },
  });
  return Boolean(membership);
}
