import { cn } from "@/lib/utils";

/**
 * House mark: a leaf built from two sweeping ribbons — the same gesture as the
 * Yoshlar ittifoqi swoosh, drawn from scratch so it stays crisp at 16px.
 */
export function SwooshMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
    >
      <defs>
        <linearGradient id="swoosh-a" x1="4" y1="28" x2="28" y2="4" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B7A3A" />
          <stop offset="0.52" stopColor="#1E9E4F" />
          <stop offset="1" stopColor="#2458D6" />
        </linearGradient>
        <linearGradient id="swoosh-b" x1="9" y1="29" x2="29" y2="9" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2458D6" stopOpacity="0.95" />
          <stop offset="1" stopColor="#5C8BF0" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <path
        d="M3.4 27.2C3.4 14.05 14.05 3.4 27.2 3.4c0 13.15-10.65 23.8-23.8 23.8Z"
        fill="url(#swoosh-a)"
      />
      <path
        d="M9.6 28.6c-.15-6.9 2.2-12.6 7.4-17.1 3.6-3.1 7.9-4.7 12.2-5.1"
        stroke="url(#swoosh-b)"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Motion lines: five tapered sweeps in the swoosh's own gesture. */
export function BrandRibbon({ className }: { className?: string }) {
  const curves = [
    { d: "M-40 660C170 470 400 330 660 235c190-70 380-108 580-124", w: 1.6, o: 0.5 },
    { d: "M-40 730C180 530 420 380 690 278c196-74 392-114 600-130", w: 1.2, o: 0.38 },
    { d: "M-30 800C190 590 440 430 720 320c204-78 408-120 620-136", w: 1, o: 0.28 },
    { d: "M-20 870C200 650 460 480 750 362c212-82 424-126 640-142", w: 0.8, o: 0.2 },
    { d: "M0 940C220 710 480 530 780 404c220-86 440-132 660-148", w: 0.7, o: 0.14 },
  ];
  return (
    <svg
      viewBox="0 0 1200 700"
      fill="none"
      aria-hidden
      preserveAspectRatio="xMaxYMid slice"
      className={className}
    >
      <defs>
        <linearGradient id="ribbon-line" x1="120" y1="700" x2="1180" y2="60" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B7A3A" />
          <stop offset="0.42" stopColor="#1E9E4F" />
          <stop offset="0.72" stopColor="#2458D6" />
          <stop offset="1" stopColor="#5C8BF0" />
        </linearGradient>
      </defs>
      {curves.map((c, i) => (
        <path
          key={i}
          d={c.d}
          stroke="url(#ribbon-line)"
          strokeWidth={c.w}
          strokeOpacity={c.o}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

/** Official lockup, keyed to transparency so it sits directly on dark surfaces. */
export function YoshlarIttifoqiLockup({
  className,
  height = 40,
  label = "O‘zbekiston Yoshlar ittifoqi",
}: {
  className?: string;
  height?: number;
  label?: string;
}) {
  if (height < 44) {
    // Small sizes: the emblem stays readable, the wordmark would not — show the emblem only.
    return (
      <span className={cn("inline-flex items-center gap-2.5", className)}>
        <SwooshMark size={height} />
        <span className="text-[10px] font-semibold uppercase leading-[1.35] tracking-[0.14em] text-white/60">
          O‘zbekiston
          <br />
          Yoshlar ittifoqi
        </span>
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center", className)} style={{ height }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/yoshlar-ittifoqi-mark.png"
        alt={label}
        style={{ height: "100%", width: "auto" }}
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
