"use client";
import { useState } from "react";
import { FAQ } from "@/config/site";
import { ChevronIcon } from "./Icons";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mt-8 space-y-3">
      {FAQ.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="card">
            <h3>
              <button
                id={`faq-btn-${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 rounded-[1.25rem] px-5 py-4 text-left font-bold"
              >
                {item.q}
                <ChevronIcon className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
            </h3>
            <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} hidden={!isOpen} className="px-5 pb-5 text-ink/85">
              {item.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
