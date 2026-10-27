import Link from "next/link";
import { Trash2 } from "lucide-react";
import { managedClubIds } from "@/lib/auth";
import { requireStaffPage } from "@/lib/session";
import { db } from "@/lib/db";
import { deleteEventAction, saveEventAction } from "@/app/actions/admin";
import { PageHeader, Panel, StatusPill, FieldLabel } from "@/components/admin/ui";
import { FormDialog } from "@/components/admin/form-dialog";
import { formatDate, timeRange } from "@/lib/format";

export const metadata = { title: "Tadbirlar" };

function toLocalInput(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default async function AdminEventsPage({ searchParams }: { searchParams: Promise<{ club?: string; filter?: string }> }) {
  const params = await searchParams;
  const user = await requireStaffPage();
  const scope = await managedClubIds(user);

  const clubs = await db.club.findMany({
    where: scope === "all" ? { isActive: true } : { id: { in: scope } },
    orderBy: { sortOrder: "asc" },
    select: { id: true, name: true, slug: true, accent: true },
  });
  const selected = params.club ? clubs.find((c) => c.slug === params.club) : clubs[0];
  const filter = params.filter ?? "upcoming";

  const events = await db.event.findMany({
    where: {
      clubId: selected?.id ?? "-",
      ...(filter === "upcoming" ? { startsAt: { gte: new Date() } } : filter === "past" ? { startsAt: { lt: new Date() } } : {}),
    },
    orderBy: { startsAt: filter === "past" ? "desc" : "asc" },
    include: { _count: { select: { rsvps: true } } },
    take: 50,
  });

  const eventForm = (event?: (typeof events)[number]) => (
    <form action={saveEventAction} className="space-y-3">
      {event && <input type="hidden" name="id" value={event.id} />}
      <input type="hidden" name="clubId" value={selected?.id} />
      <div>
        <FieldLabel>Sarlavha</FieldLabel>
        <input name="title" defaultValue={event?.title} className="input" required maxLength={160} placeholder="Bookonomics: It yurak" />
      </div>
      <div>
        <FieldLabel>Tavsif</FieldLabel>
        <textarea name="description" defaultValue={event?.description} rows={4} className="textarea" required maxLength={4000} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel>Turi</FieldLabel>
          <select name="type" defaultValue={event?.type ?? "meetup"} className="select">
            <option value="meetup">Uchrashuv</option>
            <option value="workshop">Seminar</option>
            <option value="contest">Tanlov</option>
            <option value="trip">Sayohat</option>
            <option value="sport">Sport</option>
          </select>
        </div>
        <div>
          <FieldLabel>Joy</FieldLabel>
          <input name="location" defaultValue={event?.location} className="input" required placeholder="2-bino, 207-xona" />
        </div>
        <div>
          <FieldLabel>Boshlanish</FieldLabel>
          <input type="datetime-local" name="startsAt" defaultValue={event ? toLocalInput(event.startsAt) : ""} className="input" required />
        </div>
        <div>
          <FieldLabel>Tugash</FieldLabel>
          <input type="datetime-local" name="endsAt" defaultValue={event?.endsAt ? toLocalInput(event.endsAt) : ""} className="input" />
        </div>
        <div>
          <FieldLabel>Joylar soni</FieldLabel>
          <input name="capacity" defaultValue={event?.capacity ?? ""} className="input" inputMode="numeric" placeholder="60" />
        </div>
        <div>
          <FieldLabel>Holat</FieldLabel>
          <select name="status" defaultValue={event?.status ?? "PUBLISHED"} className="select">
            <option value="PUBLISHED">E’lon qilingan</option>
            <option value="DRAFT">Qoralama</option>
            <option value="CANCELLED">Bekor qilingan</option>
          </select>
        </div>
        {!event && (
          <div className="sm:col-span-2">
            <FieldLabel>Takrorlanish</FieldLabel>
            <select name="repeat" defaultValue="0" className="select">
              <option value="0">Bir marta</option>
              <option value="3">Har hafta · 4 marta</option>
              <option value="7">Har hafta · 8 marta</option>
              <option value="11">Har hafta · 12 marta</option>
            </select>
            <p className="mt-1.5 text-[11px] leading-relaxed text-[color:var(--color-muted)]">
              Bir xil vaqtda, har hafta. Har bir uchrashuv alohida tadbir bo‘lib, RSVP va taqvim
              obunasi o‘zgarishsiz ishlaydi.
            </p>
          </div>
        )}
      </div>
      <button className="btn btn-primary w-full">Saqlash</button>
    </form>
  );

  return (
    <div>
      <PageHeader
        title="Tadbirlar"
        description="Tadbir e’lon qilinganda sayt va mini-ilovada ko‘rinadi, RSVP darhol ochiladi."
        action={
          <div className="flex items-center gap-2">
            {selected && (
              <a
                href={`/api/admin/export?type=rsvps&club=${selected.slug}`}
                className="btn btn-secondary btn-sm"
                title="Ishtirokchilarni CSV fayl sifatida yuklab olish"
              >
                Ishtirokchilar CSV
              </a>
            )}
            {selected ? <FormDialog label="Tadbir qo‘shish" title="Yangi tadbir" description={selected.name}>{eventForm()}</FormDialog> : null}
          </div>
        }
      />

      <div className="hide-scrollbar fade-x mb-4 flex items-center gap-1.5 overflow-x-auto pb-1">
        {clubs.map((c) => (
          <Link
            key={c.id}
            href={`/admin/events?club=${c.slug}&filter=${filter}`}
            className={`rounded-full border px-3 py-1.5 text-[11.5px] font-semibold ${
              selected?.id === c.id ? "border-[color:var(--color-ink)] bg-[color:var(--color-ink)] text-[color:var(--color-paper)]" : "border-[color:var(--color-line)] bg-white text-[color:var(--color-ink-soft)]"
            }`}
          >
            {c.name}
          </Link>
        ))}
        <div className="ml-auto flex gap-1">
          {[["upcoming", "Kelgusi"], ["past", "O‘tgan"], ["all", "Barchasi"]].map(([v, l]) => (
            <Link
              key={v}
              href={`/admin/events?club=${selected?.slug ?? ""}&filter=${v}`}
              className={`rounded-[6px] px-2.5 py-1.5 text-[11px] font-medium ${filter === v ? "bg-[color:var(--color-surface-3)] text-[color:var(--color-link)]" : "text-[color:var(--color-muted)]"}`}
            >
              {l}
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {events.map((e) => (
          <Panel key={e.id}>
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-semibold">{e.title}</p>
                  <StatusPill status={e.status} />
                </div>
                <p className="mt-0.5 text-[11.5px] text-[color:var(--color-muted)]">
                  {formatDate(e.startsAt, "d MMMM, EEEE")} · {timeRange(e.startsAt, e.endsAt)} · {e.location} · {e._count.rsvps} RSVP
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/events/${e.id}/davomat`} className="btn btn-secondary btn-sm">
                  Davomat
                </Link>
                <FormDialog label="Tahrirlash" title={e.title} variant="secondary">{eventForm(e)}</FormDialog>
                <form action={deleteEventAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <button className="btn btn-ghost btn-sm text-[color:var(--color-danger)]" aria-label="O‘chirish">
                    <Trash2 size={13} />
                  </button>
                </form>
              </div>
            </div>
          </Panel>
        ))}
        {events.length === 0 && (
          <div className="rounded-[12px] border border-dashed border-[color:var(--color-line-strong)] bg-white px-6 py-10 text-center text-[12.5px] text-[color:var(--color-muted)]">
            Tadbir topilmadi.
          </div>
        )}
      </div>
    </div>
  );
}
