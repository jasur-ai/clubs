import Link from "next/link";
import { Logo } from "@/components/site/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="mt-10 font-serif text-[64px] leading-none text-[color:var(--color-link)]">404</p>
      <h1 className="mt-3 text-[20px] font-semibold">Sahifa topilmadi</h1>
      <p className="mt-2 max-w-sm text-sm text-[color:var(--color-muted)]">
        Havola o‘zgargan bo‘lishi mumkin. Klublar katalogidan boshlang.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn btn-primary">Bosh sahifa</Link>
        <Link href="/clubs" className="btn btn-secondary">Klublar</Link>
      </div>
    </div>
  );
}
