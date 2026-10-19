import { saveBookAction } from "@/app/actions/admin";
import { FieldLabel } from "@/components/admin/ui";

type Club = { id: string; name: string };
type Book = {
  id: string;
  clubId: string;
  title: string;
  author: string;
  year: number | null;
  pages: number | null;
  genre: string | null;
  language: string;
  description: string;
};

export function BookForm({ clubs, book, defaultClubId }: { clubs: Club[]; book?: Book; defaultClubId?: string }) {
  return (
    <form action={saveBookAction} className="space-y-3">
      {book && <input type="hidden" name="id" value={book.id} />}
      <div>
        <FieldLabel>Klub</FieldLabel>
        <select name="clubId" defaultValue={book?.clubId ?? defaultClubId ?? clubs[0]?.id} className="select" required>
          {clubs.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <FieldLabel>Kitob nomi</FieldLabel>
          <input name="title" defaultValue={book?.title} className="input" required maxLength={160} placeholder="Ikki eshik orasi" />
        </div>
        <div>
          <FieldLabel>Muallif</FieldLabel>
          <input name="author" defaultValue={book?.author} className="input" required maxLength={120} placeholder="O‘tkir Hoshimov" />
        </div>
        <div>
          <FieldLabel>Yil</FieldLabel>
          <input name="year" defaultValue={book?.year ?? ""} className="input" inputMode="numeric" placeholder="1986" />
        </div>
        <div>
          <FieldLabel>Betlar</FieldLabel>
          <input name="pages" defaultValue={book?.pages ?? ""} className="input" inputMode="numeric" placeholder="320" />
        </div>
        <div>
          <FieldLabel>Janr</FieldLabel>
          <input name="genre" defaultValue={book?.genre ?? ""} className="input" placeholder="Roman" />
        </div>
        <div>
          <FieldLabel>Til</FieldLabel>
          <select name="language" defaultValue={book?.language ?? "uz"} className="select">
            <option value="uz">O‘zbek</option>
            <option value="ru">Rus</option>
            <option value="en">Ingliz</option>
          </select>
        </div>
      </div>
      <div>
        <FieldLabel>Annotatsiya</FieldLabel>
        <textarea name="description" defaultValue={book?.description} rows={4} className="textarea" required maxLength={2000} placeholder="Qisqa mazmun, nima uchun bu kitob tanlandi." />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Muqova — boshlanish</FieldLabel>
          <input type="color" name="coverFrom" defaultValue="#104070" className="h-9 w-full rounded-[6px] border border-[color:var(--color-line)] bg-white px-1" />
        </div>
        <div>
          <FieldLabel>Muqova — tugash</FieldLabel>
          <input type="color" name="coverTo" defaultValue="#2070D0" className="h-9 w-full rounded-[6px] border border-[color:var(--color-line)] bg-white px-1" />
        </div>
      </div>
      <button className="btn btn-primary w-full">Saqlash</button>
    </form>
  );
}
