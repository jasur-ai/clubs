import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lock } from "lucide-react";
import { requireUserPage } from "@/lib/session";
import { db } from "@/lib/db";
import { Avatar } from "@/components/ui/primitives";
import { createPostAction } from "@/app/actions/member";
import { formatDateTime, relativeDate } from "@/lib/format";

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUserPage();
  const thread = await db.discussionThread.findUnique({
    where: { id },
    include: {
      club: { select: { name: true, slug: true } },
      author: { select: { firstName: true, lastName: true, photoUrl: true, role: true } },
      posts: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { firstName: true, lastName: true, photoUrl: true, role: true } } },
      },
    },
  });
  if (!thread) notFound();

  return (
    <div className="space-y-4">
      <Link href="/app/discussions" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[color:var(--color-muted)]">
        <ArrowLeft size={13} /> Muhokamalar
      </Link>

      <div className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-4">
        <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[color:var(--color-muted)]">
          <span>{thread.club.name}</span>
          <span>·</span>
          <span>{thread.kind === "QUESTION" ? "Savol" : "Muhokama"}</span>
        </div>
        <h1 className="mt-2 font-serif text-[21px] leading-snug">{thread.title}</h1>
        <div className="mt-3 flex items-center gap-2">
          <Avatar first={thread.author?.firstName ?? "T"} last={thread.author?.lastName} src={thread.author?.photoUrl} size={26} />
          <div>
            <p className="text-[11.5px] font-semibold">
              {thread.author ? `${thread.author.firstName} ${thread.author.lastName ?? ""}` : "TDIU Clubs"}
            </p>
            <p className="text-[10px] text-[color:var(--color-muted)]">{formatDateTime(thread.createdAt)}</p>
          </div>
        </div>
        <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-[color:var(--color-ink-soft)]">{thread.body}</p>
      </div>

      <div className="space-y-2">
        {thread.posts.map((p) => (
          <div key={p.id} className="rounded-[12px] border border-[color:var(--color-line)] bg-white p-3.5">
            <div className="flex items-center gap-2">
              <Avatar first={p.author.firstName} last={p.author.lastName} src={p.author.photoUrl} size={24} />
              <span className="text-[11.5px] font-semibold">
                {p.author.firstName} {p.author.lastName ?? ""}
              </span>
              {p.author.role !== "MEMBER" && (
                <span className="rounded-full bg-[color:var(--color-surface-2)] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[color:var(--color-link)]">
                  {p.author.role === "CLUB_ADMIN" ? "Rahbar" : "Admin"}
                </span>
              )}
              <span className="ml-auto text-[10px] text-[color:var(--color-muted)]">{relativeDate(p.createdAt)}</span>
            </div>
            <p className="mt-2 whitespace-pre-line text-[12.5px] leading-relaxed">{p.body}</p>
          </div>
        ))}
        {thread.posts.length === 0 && (
          <p className="py-4 text-center text-[12px] text-[color:var(--color-muted)]">Birinchi javobni yozing.</p>
        )}
      </div>

      {thread.isLocked ? (
        <p className="flex items-center justify-center gap-2 rounded-[12px] border border-[color:var(--color-line)] bg-white p-4 text-[12px] text-[color:var(--color-muted)]">
          <Lock size={14} /> Mavzu yopilgan
        </p>
      ) : (
        <form action={createPostAction} className="rounded-[14px] border border-[color:var(--color-line)] bg-white p-3">
          <input type="hidden" name="threadId" value={thread.id} />
          <textarea name="body" rows={3} className="textarea" placeholder="Javob yozing" maxLength={4000} required />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[10px] text-[color:var(--color-muted)]">+2 ball</span>
            <button className="btn btn-accent btn-sm">Yuborish</button>
          </div>
        </form>
      )}
    </div>
  );
}
