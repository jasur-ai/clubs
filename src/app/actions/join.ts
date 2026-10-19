"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

export type JoinState = { ok?: boolean; error?: string; fieldErrors?: Record<string, string> };

const schema = z.object({
  clubSlug: z.string().min(1),
  fullName: z.string().min(3, "To‘liq ismni kiriting"),
  faculty: z.string().min(2, "Fakultetni kiriting"),
  course: z.string().min(1, "Kursni tanlang"),
  group: z.string().optional(),
  phone: z
    .string()
    .min(9, "Telefon raqamini kiriting")
    .regex(/^[+0-9\s()-]{9,20}$/, "Telefon formati xato"),
  telegram: z.string().min(3, "Telegram username kiriting"),
  motivation: z.string().max(600, "600 belgidan oshmasin").optional(),
  consent: z.literal("on", { errorMap: () => ({ message: "Ma’lumotlarga rozilik kerak" }) }),
});

export async function submitJoinRequest(_prev: JoinState, formData: FormData): Promise<JoinState> {
  const raw = {
    clubSlug: String(formData.get("clubSlug") ?? ""),
    fullName: String(formData.get("fullName") ?? "").trim(),
    faculty: String(formData.get("faculty") ?? "").trim(),
    course: String(formData.get("course") ?? ""),
    group: String(formData.get("group") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").replace(/\s+/g, ""),
    telegram: String(formData.get("telegram") ?? "").trim(),
    motivation: String(formData.get("motivation") ?? "").trim(),
    consent: formData.get("consent"),
  };

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "Formada xatoliklar bor", fieldErrors };
  }

  const club = await db.club.findUnique({ where: { slug: parsed.data.clubSlug }, select: { id: true, name: true } });
  if (!club) return { ok: false, error: "Klub topilmadi" };

  const session = await getSession();

  const duplicate = await db.joinRequest.findFirst({
    where: {
      clubId: club.id,
      telegram: parsed.data.telegram,
      status: { in: ["NEW", "IN_REVIEW", "APPROVED"] },
    },
    select: { id: true },
  });
  if (duplicate) {
    return { ok: false, error: "Bu Telegram username bilan ariza allaqachon mavjud" };
  }

  await db.joinRequest.create({
    data: {
      clubId: club.id,
      userId: session?.id ?? null,
      fullName: parsed.data.fullName,
      faculty: parsed.data.faculty,
      course: parsed.data.course,
      group: parsed.data.group || null,
      phone: parsed.data.phone,
      telegram: parsed.data.telegram,
      motivation: parsed.data.motivation || null,
    },
  });

  // notify club managers inside the product (bot delivery is handled by the webhook worker)
  const managers = await db.membership.findMany({
    where: { clubId: club.id, role: { in: ["PRESIDENT", "MANAGER"] }, status: "ACTIVE" },
    select: { userId: true },
  });
  if (managers.length) {
    await db.notification.createMany({
      data: managers.map((m) => ({
        userId: m.userId,
        title: "Yangi a’zolik so‘rovi",
        body: `${parsed.data.fullName} — ${club.name}`,
        url: "/admin/join-requests",
      })),
    });
  }

  revalidatePath("/admin/join-requests");
  revalidatePath("/admin");
  return { ok: true };
}
