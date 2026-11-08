"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ILLUSTRATIONS, type IllustrationKey } from "./Illustrations";

export type Slide = { service: string; label: string; url: string | null; desktop: string | null; mobile: string | null; illustration?: IllustrationKey };

/** Auto-rotating browser + phone mockup showing sample screenshots of the live demos. */
export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [hold, setHold] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [armed, setArmed] = useState(false); // load later slides only after the first paint settles

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const t = setTimeout(() => setArmed(true), 2500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (hold || reduced || !armed) return;
    const t = setInterval(() => setI((n) => (n + 1) % slides.length), 4000);
    return () => clearInterval(t);
  }, [hold, reduced, armed, slides.length]);

  const cur = slides[i];
  return (
    <div
      role="group"
      aria-roledescription="carousel"
      aria-label="Sample work"
      onMouseEnter={() => setHold(true)}
      onMouseLeave={() => setHold(false)}
      onFocus={() => setHold(true)}
      onBlur={() => setHold(false)}
    >
      <div className="relative">
        <div className="overflow-hidden rounded-xl border border-ink/10 bg-white shadow-xl">
          <div className="flex items-center gap-1.5 border-b border-ink/10 bg-mist px-3 py-2" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b5e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#f5c04a]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#4cc16b]" />
            <span className="ml-3 truncate rounded-md bg-white px-2 py-0.5 text-[10px] text-ink/80">{cur.url ? cur.url.replace("https://", "") : "your-business.com"}</span>
          </div>
          <div className="relative aspect-[1280/800] w-full bg-ink-soft [container-type:inline-size]">
            {slides.map((s, n) => (n > 0 && !armed ? null : (
              <div key={s.service} className={`absolute inset-0 transition-opacity duration-700 ${n === i ? "opacity-100" : "opacity-0"}`} aria-hidden={n !== i}>
                {s.illustration ? (
                  (() => { const Ill = ILLUSTRATIONS[s.illustration]; return <Ill />; })()
                ) : s.desktop ? (
                  <Image src={s.desktop} alt={`${s.service}: ${s.label}`} width={1280} height={800} sizes="(min-width: 1024px) 560px, 92vw" priority={n === 0} className="h-full w-full object-cover object-top" />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-ink via-ink-soft to-teal-dark p-6 text-lg font-bold text-white">{s.service}</div>
                )}
              </div>
            )))}
          </div>
        </div>
        <div className={`absolute -bottom-5 -right-2 w-[24%] min-w-[78px] overflow-hidden rounded-[1.1rem] border-[5px] border-ink bg-ink shadow-2xl sm:-right-4 transition-opacity duration-700 ${cur.illustration ? "opacity-0" : "opacity-100"}`}>
          <div className="relative aspect-[390/844] w-full">
            {slides.map((s, n) => (n > 0 && !armed ? null : (
              <div key={s.service} className={`absolute inset-0 transition-opacity duration-700 ${n === i ? "opacity-100" : "opacity-0"}`} aria-hidden="true">
                {s.mobile ? (
                  <Image src={s.mobile} alt="" width={390} height={844} sizes="140px" priority={n === 0} className="h-full w-full object-cover object-top" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-b from-teal-dark to-ink" />
                )}
              </div>
            )))}
          </div>
        </div>
      </div>

      <div className="mt-10 flex items-center justify-between gap-3">
        <p className="text-sm text-white/90" aria-live={hold || reduced ? "polite" : "off"}>
          <span className="font-bold">{cur.service}</span> · {cur.label}
        </p>
        <div className="flex gap-2">
          {slides.map((s, n) => (
            <button
              key={s.service}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Show ${s.service}`}
              aria-current={n === i}
              className="flex h-6 w-6 items-center justify-center"
            >
              <span className={`block h-2.5 rounded-full transition-all ${n === i ? "w-5 bg-saffron" : "w-2.5 bg-white/50"}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
