import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CP, SERVICES, faqLd, localBusinessLd } from "@/lib/careplus";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) return {};
  return { title: `${s.h1} | CarePlus Diagnostics (Demo)`, description: `${s.intro} Demo — fictional business.`, alternates: { canonical: `/careplus/${s.slug}` } };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const s = SERVICES.find((x) => x.slug === slug);
  if (!s) notFound();
  const other = SERVICES.find((x) => x.slug !== slug)!;

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        localBusinessLd("https://neoviaai.in/careplus"),
        { "@context": "https://schema.org", "@type": "MedicalTest", name: s.title, description: s.intro, offers: { "@type": "Offer", priceCurrency: "INR", price: s.price.replace(/[^\d]/g, "") || "50" } },
        faqLd(s.faqs),
      ]) }} />
      <section className="bg-gradient-to-br from-sky-50 to-emerald-50 px-4 py-14">
        <div className="wrap max-w-4xl">
          <Link href="/careplus" className="text-sm font-bold text-sky-700 hover:underline">← CarePlus Diagnostics</Link>
          <h1 className="rise mt-3 text-4xl font-black tracking-tight text-sky-950 sm:text-5xl">{s.h1}</h1>
          <p className="rise rise-2 mt-4 max-w-2xl text-lg text-sky-950/75">{s.intro}</p>
          <div className="rise rise-3 mt-6 flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-white px-5 py-2 text-lg font-black text-sky-700 shadow ring-1 ring-sky-100">{s.price}</span>
            <a href={`https://wa.me/${CP.wa}?text=${encodeURIComponent(`Hi CarePlus, I'd like to book: ${s.h1}`)}`} target="_blank" rel="noopener noreferrer" className="btn btn-wa">Book on WhatsApp</a>
            <a href={`tel:${CP.tel}`} className="btn btn-ghost text-sky-900">📞 Call now</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="card p-6">
            <h2 className="text-xl font-extrabold text-sky-950">What’s included</h2>
            <ul className="mt-4 space-y-3">
              {s.includes.map((i) => <li key={i} className="flex gap-3 font-semibold"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500 text-xs text-white">✓</span>{i}</li>)}
            </ul>
          </div>
          <div className="card bg-sky-50 p-6">
            <h2 className="text-xl font-extrabold text-sky-950">How to prepare</h2>
            <p className="mt-3 text-sky-950/75">{s.prep}</p>
            <p className="mt-5 text-sm font-bold text-sky-900">📍 {CP.address}</p>
            <p className="text-sm font-semibold text-sky-900">🕖 {CP.hours}</p>
          </div>
        </div>
        <div className="wrap mt-10 max-w-4xl">
          <h2 className="text-2xl font-extrabold text-sky-950">Frequently asked questions</h2>
          <div className="mt-4 space-y-2">
            {s.faqs.map((f) => (
              <details key={f.q} className="card p-4">
                <summary className="cursor-pointer list-none font-bold text-sky-950">{f.q}</summary>
                <p className="mt-2 text-sm text-sky-950/70">{f.a}</p>
              </details>
            ))}
          </div>
          <Link href={`/careplus/${other.slug}`} className="card mt-8 flex items-center justify-between p-5 font-extrabold text-sky-950 transition hover:border-sky-300">
            <span>{other.icon} Also see: {other.h1}</span><span className="text-sky-600">→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
