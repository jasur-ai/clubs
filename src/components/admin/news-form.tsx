import { saveNewsAction } from "@/app/actions/admin";
import { FieldLabel } from "@/components/admin/ui";

type Club = { id: string; name: string };
type News = {
  id: string;
  clubId: string | null;
  title: string;
  excerpt: string;
  body: string;
  status: string;
  imageUrl?: string | null;
};

export function NewsForm({ clubs, item, lockedClubId }: { clubs: Club[]; item?: News; lockedClubId?: string }) {
  return (
    <form action={saveNewsAction} className="space-y-3">
      {item && <input type="hidden" name="id" value={item.id} />}
      {!lockedClubId && (
        <div>
          <FieldLabel>Kim uchun</FieldLabel>
          <select name="clubId" defaultValue={item?.clubId ?? "none"} className="select">
            <option value="none">Umumiy (barcha klublar)</option>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}
      {lockedClubId && <input type="hidden" name="clubId" value={lockedClubId} />}
      <div>
        <FieldLabel>Antisarlavha</FieldLabel>
        <input name="title" defaultValue={item?.title} className="input" required maxLength={180} placeholder="Bookonomics mavsumi ochildi" />
      </div>
      <div>
        <FieldLabel>Qisqa mazmun</FieldLabel>
        <textarea name="excerpt" defaultValue={item?.excerpt} rows={2} className="textarea" required maxLength={300} />
      </div>
      <div>
        <FieldLabel>Matn</FieldLabel>
        <textarea name="body" defaultValue={item?.body} rows={8} className="textarea" required maxLength={20000} />
      </div>
      <div>
        <FieldLabel>Rasm manzili</FieldLabel>
        <input
          name="imageUrl"
          defaultValue={item?.imageUrl ?? ""}
          className="input"
          maxLength={500}
          placeholder="/books/it-yurak.jpg yoki https://…"
        />
        <p className="mt-1 text-[11px] leading-relaxed text-[color:var(--color-muted)]">
          Kitob haqidagi yangilikda — o‘sha kitobning muqovasi. Bo‘sh qoldirilsa, karta sana
          plastinkasi bilan chiziladi.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Holat</FieldLabel>
          <select name="status" defaultValue={item?.status ?? "PUBLISHED"} className="select">
            <option value="PUBLISHED">E’lon qilish</option>
            <option value="DRAFT">Qoralama</option>
          </select>
        </div>
        <div>
          <FieldLabel>Muqova rangi</FieldLabel>
          <input type="color" name="coverFrom" defaultValue="#1f4a33" className="h-9 w-full rounded-[6px] border border-[color:var(--color-line)] bg-white px-1" />
        </div>
      </div>
      <input type="hidden" name="coverTo" value="#3f7a55" />
      <button className="btn btn-primary w-full">Saqlash</button>
    </form>
  );
}
