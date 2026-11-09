import Link from "next/link";
import { CP } from "@/lib/careplus";

export default function CarePlusLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white">
      <div className="bg-ink px-4 py-2 text-center text-xs font-semibold text-white print:hidden">
        LocalRank demo by Neovia AI · <Link href="/careplus" className="text-saffron underline">Home</Link> · <Link href="/careplus/before-after" className="underline">Before / After</Link> · <Link href="/careplus/monthly-report" className="underline">Monthly report</Link>
      </div>
      <header className="sticky top-0 z-30 border-b border-sky-100 bg-white/95 backdrop-blur print:hidden">
        <div className="wrap flex items-center justify-between gap-3 px-4 py-3">
          <Link href="/careplus" className="flex items-center gap-2 text-lg font-black text-sky-900">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-sky-500 to-emerald-400 text-white">✚</span>
            CarePlus <span className="font-medium text-sky-700">Diagnostics</span>
          </Link>
          <div className="flex gap-2">
            <a href={`tel:${CP.tel}`} className="btn btn-ghost px-4 py-2 text-sm text-sky-900">📞 Call</a>
            <a href={`https://wa.me/${CP.wa}?text=${encodeURIComponent("Hi CarePlus, I'd like to book a test.")}`} target="_blank" rel="noopener noreferrer" className="btn btn-wa px-4 py-2 text-sm">WhatsApp</a>
          </div>
        </div>
      </header>
      {children}
      <footer className="bg-sky-950 px-4 py-8 text-center text-sm text-sky-100/70 print:hidden">
        <p className="font-bold text-white">{CP.name}</p>
        <p>{CP.address}</p>
        <p>{CP.phone} · {CP.hours}</p>
        <p className="mt-3 inline-block rounded-full bg-saffron px-4 py-1 font-extrabold text-ink">Demo — fictional business</p>
      </footer>
    </div>
  );
}
