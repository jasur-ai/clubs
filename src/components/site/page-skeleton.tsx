/**
 * Route-level loading shells.
 *
 * Every list page fetches on the server, so a navigation can pause for a moment
 * on a cold instance. These placeholders keep the same geometry as the real
 * page, which makes the transition feel like content arriving rather than a
 * layout jump.
 */
export function PageSkeleton({ variant = "grid" }: { variant?: "grid" | "list" | "detail" }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:py-16" aria-busy="true" aria-live="polite">
      <span className="skeleton block h-2.5 w-16 rounded-full" />
      <span className="skeleton mt-4 block h-8 w-[280px] rounded-[8px]" />
      <span className="skeleton mt-3 block h-3 w-[420px] max-w-full rounded-full" />

      {variant === "grid" && (
        <>
          <div className="mt-8 flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="skeleton h-8 w-24 rounded-full" />
            ))}
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-5">
                <div className="flex items-center gap-3">
                  <span className="skeleton h-11 w-11 rounded-[9px]" />
                  <span className="flex-1 space-y-2">
                    <span className="skeleton block h-3 w-2/3 rounded-full" />
                    <span className="skeleton block h-2.5 w-1/3 rounded-full" />
                  </span>
                </div>
                <span className="skeleton mt-4 block h-2.5 w-full rounded-full" />
                <span className="skeleton mt-2 block h-2.5 w-4/5 rounded-full" />
              </div>
            ))}
          </div>
        </>
      )}

      {variant === "list" && (
        <div className="mt-9 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 border-b border-[color:var(--color-line)] pb-4">
              <span className="skeleton h-11 w-11 rounded-[9px]" />
              <span className="flex-1 space-y-2">
                <span className="skeleton block h-3 w-1/2 rounded-full" />
                <span className="skeleton block h-2.5 w-1/3 rounded-full" />
              </span>
              <span className="skeleton h-3 w-10 rounded-full" />
            </div>
          ))}
        </div>
      )}

      {variant === "detail" && (
        <div className="mt-9 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-3">
            <span className="skeleton block h-4 w-24 rounded-full" />
            <span className="skeleton block h-9 w-4/5 rounded-[8px]" />
            <span className="skeleton block h-3 w-full rounded-full" />
            <span className="skeleton block h-3 w-5/6 rounded-full" />
            <span className="skeleton block h-3 w-2/3 rounded-full" />
          </div>
          <div className="rounded-[14px] border border-[color:var(--color-line)] bg-[color:var(--color-surface)] p-4">
            <span className="skeleton block h-3 w-1/3 rounded-full" />
            <span className="skeleton mt-4 block h-10 w-full rounded-[9px]" />
            <span className="skeleton mt-2 block h-10 w-full rounded-[9px]" />
          </div>
        </div>
      )}
    </div>
  );
}
