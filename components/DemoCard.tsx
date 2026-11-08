import { waLink, type Demo } from "@/config/site";
import BookNow from "./BookNow";
import DemoVisual from "./DemoVisual";
import { ArrowIcon, CheckIcon, WhatsAppIcon } from "./Icons";

export default function DemoCard({ demo, cardEnabled }: { demo: Demo; cardEnabled: boolean }) {
  return (
    <article className="card flex flex-col gap-8 p-5 sm:p-6">
      <DemoVisual demo={demo} />
      <div className="mt-2 flex flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-teal/25 px-3 py-1 text-xs font-bold text-teal-dark">{demo.industry}</span>
          <span className="text-xs font-semibold text-ink/70">Demo with sample data</span>
        </div>
        <h3 className="mt-3 text-xl font-extrabold">{demo.title}</h3>
        {demo.price && <p className="text-sm font-bold text-teal-dark">Setup from ₹{demo.price.toLocaleString("en-IN")}</p>}
        <p className="mt-1 font-semibold text-ink-soft">{demo.outcomeLine}</p>
        <p className="mt-2 text-sm text-ink/80">{demo.description}</p>
        <ul className="mt-4 space-y-2 text-sm">
          {demo.features.map((f) => (
            <li key={f} className="flex gap-2">
              <CheckIcon className="mt-0.5 shrink-0 text-teal-dark" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href={demo.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            Open live demo <ArrowIcon />
          </a>
          <a
            href={waLink(`Hi Neovia AI, I saw your "${demo.title}" demo and I'd like this for my business.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost text-ink"
          >
            <WhatsAppIcon className="text-[#15803d]" /> Get this for my business
          </a>
          <BookNow title={demo.title} slug={demo.slug} price={demo.price} cardEnabled={cardEnabled} />
        </div>
      </div>
    </article>
  );
}

