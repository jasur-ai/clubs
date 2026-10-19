"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { createThreadAction } from "@/app/actions/member";

export function NewThreadForm({ clubs }: { clubs: Array<{ id: string; name: string }> }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-primary btn-sm gap-1.5">
        <Plus size={14} /> Mavzu
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0b1f33]/40 p-0 sm:items-center sm:p-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-[480px] rounded-t-[18px] bg-white p-5 sm:rounded-[18px]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-[20px]">Yangi mavzu</h2>
          <button onClick={() => setOpen(false)} aria-label="Yopish" className="text-[color:var(--color-muted)]">
            <X size={18} />
          </button>
        </div>
        <form action={createThreadAction} className="mt-4 space-y-3" onSubmit={() => setTimeout(() => setOpen(false), 300)}>
          {clubs.length > 1 && (
            <select name="clubId" className="select" required>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}
          {clubs.length === 1 && <input type="hidden" name="clubId" value={clubs[0].id} />}
          <select name="kind" className="select" defaultValue="DISCUSSION">
            <option value="DISCUSSION">Fikr almashish</option>
            <option value="QUESTION">Savol</option>
          </select>
          <input name="title" className="input" placeholder="Mavzu sarlavhasi" minLength={6} maxLength={140} required />
          <textarea name="body" className="textarea" rows={5} placeholder="Fikringiz yoki savolingiz" minLength={10} maxLength={4000} required />
          <p className="text-[11px] leading-relaxed text-[color:var(--color-muted)]">
            Spoiler uchun: bob raqamini yozing va sahifadan keyingi fikrlarni alohida xabar qilib yuboring.
          </p>
          <button className="btn btn-accent w-full">E’lon qilish</button>
        </form>
      </div>
    </div>
  );
}
