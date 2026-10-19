import "server-only";

import { redirect } from "next/navigation";
import { getSession, isAdminRole, type SessionUser } from "@/lib/auth";

/** Page-level guard: layouts and pages render concurrently in the App Router. */
export async function requireUserPage(next = "/app"): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect(`/login?next=${encodeURIComponent(next)}`);
  return user;
}

export async function requireStaffPage(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) redirect("/login?next=/admin");
  if (!isAdminRole(user.role)) redirect("/app");
  return user;
}
