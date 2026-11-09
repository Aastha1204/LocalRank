import type { Metadata } from "next";
import Link from "next/link";
import BookingForm from "@/components/careplus/BookingForm";
import { CP, GENERAL_FAQS, SERVICES, TESTS, faqLd, localBusinessLd } from "@/lib/careplus";

export const metadata: Metadata = {
  title: "Pathology Lab in Dombivli East | CarePlus Diagnostics (Demo)",
  description: "Blood tests, thyroid profile and full body checkups in Dombivli East. Home sample collection in Kalyan and Dombivli. Reports on WhatsApp. Demo — fictional business.",
  alternates: { canonical: "/careplus" },
};

const STATS: [string, string][] = [["4.7★", "Google rating"], ["6 hrs", "Report time"], ["7 days", "Open weekly"], ["72+", "Tests in one checkup"]];

export default function CarePlusHome() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([localBusinessLd("https://neoviaai.in/careplus"), faqLd(GENERAL_FAQS)]) }} />

      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-white to-emerald-50 px-4 pb-16 pt-12">
        <div className="lr-blob -right-24 -top-24 h-96 w-96 bg-sky-300/40" />
        <div className="lr-blob -bottom-24 left-0 h-80 w-80 bg-emerald-300/40 [animation-delay:-5s]" />
        <div className="wrap relative grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="rise inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-emerald-800">Dombivli East · Open today till 8 PM</p>
            <h1 className="rise rise-2 mt-4 text-4xl font-black leading-[1.08] tracking-tight text-sky-950 sm:text-5xl">Trusted pathology lab in <span className="text-sky-600">Dombivli East</span></h1>
            <p className="rise rise-3 mt-4 max-w-lg text-lg text-sky-950/75">{CP.tagline} Walk in, or book a home sample collection across Dombivli and Kalyan.</p>
            <div className="rise rise-3 mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#book" className="btn btn-primary">Book a test online</a>
              <a href={`tel:${CP.tel}`} className="btn btn-ghost text-sky-900">📞 {CP.phone}</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {STATS.map(([k, v], i) => (
              <div key={v} className="lr-float rounded-2xl bg-white p-5 shadow-xl shadow-sky-900/10 ring-1 ring-sky-100" style={{ animationDelay: `${-i * 1.3}s` }}>
                <p className="text-3xl font-black text-sky-700">{k}</p>
                <p className="text-sm font-semibold text-sky-950/60">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="h2 text-sky-950">Popular services</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {SERVICES.map((s) => (
              <Link key={s.slug} href={`/careplus/${s.slug}`} className="group card flex items-center gap-5 p-6 transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-2xl">
                <span className="text-5xl transition group-hover:scale-110">{s.icon}</span>
                <span className="flex-1">
                  <span className="block text-xl font-extrabold text-sky-950">{s.h1}</span>
                  <span className="block text-sm text-sky-950/60">{s.short} · from <b>{s.price}</b></span>
                </span>
                <span className="text-2xl text-sky-600 transition group-hover:translate-x-1">→</span>
              </Link>
            ))}
          </div>
          <div className="mt-8 overflow-hidden rounded-2xl ring-1 ring-sky-100">
            <table className="w-full text-left text-sm">
              <caption className="bg-sky-50 px-4 py-3 text-left font-extrabold text-sky-950">Test price list</caption>
              <tbody>
                {TESTS.map((t) => <tr key={t.name} className="border-t border-sky-100 transition hover:bg-sky-50"><td className="px-4 py-3 font-semibold">{t.name}</td><td className="px-4 text-right font-extrabold text-sky-700">{t.price}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="book" className="section bg-gradient-to-br from-sky-600 to-emerald-500">
        <div className="wrap grid items-center gap-10 lg:grid-cols-2">
          <div className="text-white">
            <h2 className="h2">Book your test online</h2>
            <p className="mt-3 max-w-md text-lg text-white/90">Pick a test, a date and a slot. Walk in, or have a phlebotomist come to your home in Dombivli and Kalyan.</p>
            <ul className="mt-6 space-y-2 font-semibold">
              {["No prescription needed for most tests", "Reports on WhatsApp in 6 hours", "Open all 7 days"].map((t) => <li key={t}>✓ {t}</li>)}
            </ul>
          </div>
          <BookingForm />
        </div>
      </section>

      <section className="section bg-sky-50">
        <div className="wrap grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="h2 text-sky-950">Find us</h2>
            <p className="mt-3 text-sky-950/75">{CP.address}</p>
            <p className="mt-1 font-semibold text-sky-950">{CP.hours}</p>
            <div className="mt-5 flex gap-3">
              <a href={`tel:${CP.tel}`} className="btn btn-dark">📞 Click to call</a>
              <a href={`https://wa.me/${CP.wa}`} target="_blank" rel="noopener noreferrer" className="btn btn-wa">WhatsApp</a>
            </div>
            <h3 className="mt-10 text-xl font-extrabold text-sky-950">Questions</h3>
            <div className="mt-3 space-y-2">
              {GENERAL_FAQS.map((f) => (
                <details key={f.q} className="card group p-4">
                  <summary className="cursor-pointer list-none font-bold text-sky-950">{f.q}</summary>
                  <p className="mt-2 text-sm text-sky-950/70">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
          <iframe title="Map of CarePlus Diagnostics" loading="lazy" className="h-96 w-full rounded-2xl border-0 shadow-xl lg:h-full lg:min-h-[28rem]"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(CP.mapQuery)}&z=15&output=embed`} />
        </div>
      </section>
    </main>
  );
}
