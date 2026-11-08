import Link from "next/link";

const LINKS = [
  ["audit", "/audit", "Free Audit"],
  ["demo", "/careplus", "Demo client"],
  ["ba", "/careplus/before-after", "Before / After"],
  ["report", "/careplus/monthly-report", "Monthly report"],
  ["admin", "/audit/admin", "Admin"],
] as const;

export default function LocalRankShell({ active, children }: { active: string; children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink/95 text-white backdrop-blur print:hidden">
        <div className="wrap flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/audit" className="flex items-center gap-2 font-black tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-saffron to-teal text-ink">📍</span>
            LocalRank <span className="hidden text-xs font-semibold text-white/50 sm:inline">by Neovia AI</span>
          </Link>
          <nav aria-label="LocalRank" className="flex gap-1 overflow-x-auto text-sm font-semibold">
            {LINKS.map(([k, h, l]) => (
              <Link key={k} href={h} className={`whitespace-nowrap rounded-full px-3 py-1.5 transition ${active === k ? "bg-white text-ink" : "text-white/75 hover:bg-white/10"}`}>{l}</Link>
            ))}
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="bg-ink px-4 py-6 text-center text-sm text-white/60 print:hidden">
        <p className="font-bold text-saffron">Demo — fictional business</p>
        <p>LocalRank is a Neovia AI demo. CarePlus Diagnostics is not a real company. <Link href="/" className="underline">neoviaai.in</Link></p>
      </footer>
    </>
  );
}
