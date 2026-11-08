"use client";
import { useRef, useState } from "react";
import { INDUSTRIES, DEMOS, waLink } from "@/config/site";
import { WhatsAppIcon } from "./Icons";

export default function IndustryTabs() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: React.KeyboardEvent, i: number) {
    let n = i;
    if (e.key === "ArrowRight") n = (i + 1) % INDUSTRIES.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + INDUSTRIES.length) % INDUSTRIES.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = INDUSTRIES.length - 1;
    else return;
    e.preventDefault();
    setActive(n);
    refs.current[n]?.focus();
  }

  const cur = INDUSTRIES[active];
  const demo = DEMOS.find((d) => d.slug === cur.demoSlug);

  return (
    <div className="mt-8">
      <div role="tablist" aria-label="Industries" className="flex flex-wrap gap-2">
        {INDUSTRIES.map((ind, i) => (
          <button
            key={ind.name}
            ref={(el) => { refs.current[i] = el; }}
            role="tab"
            id={`tab-${i}`}
            aria-selected={active === i}
            aria-controls={`panel-${i}`}
            tabIndex={active === i ? 0 : -1}
            onClick={() => setActive(i)}
            onKeyDown={(e) => onKey(e, i)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition ${
              active === i ? "bg-ink text-white" : "bg-white text-ink ring-1 ring-ink/15 hover:bg-mist"
            }`}
          >
            {ind.name}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} className="card mt-5 grid gap-6 p-6 md:grid-cols-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-dark">The usual problem</h3>
          <p className="mt-2">{cur.problem}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-dark">What I set up</h3>
          <p className="mt-2">{cur.setup}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-dark">See it in action</h3>
          {demo && (
            <>
              <p className="mt-2 font-semibold">{demo.title}</p>
              <a href="#demos" className="mt-2 inline-block text-sm font-bold text-teal-dark underline underline-offset-4">Jump to this demo ↓</a>
            </>
          )}
          <a
            href={waLink(`Hi Neovia AI, I run a business in the ${cur.name} space. Can you show me what you'd set up?`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-wa mt-4 w-full text-sm"
          >
            <WhatsAppIcon /> Chat with me on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
