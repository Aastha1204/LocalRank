"use client";
import { useEffect, useRef, useState } from "react";
import { PaymentFlow } from "./Payments";
import { CalendarIcon } from "./Icons";

/** "Book now" on a demo card: opens a dialog with that project's amount already filled in. */
export default function BookNow({ title, slug, price, cardEnabled }: { title: string; slug: string; price: number | null; cardEnabled: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-dark">
        <CalendarIcon /> Book now
      </button>
      <dialog
        ref={ref}
        aria-label={`Book ${title}`}
        className="book-dialog card w-[min(92vw,40rem)] p-0"
        onClose={() => setOpen(false)}
        onClick={(e) => { if (e.target === ref.current) setOpen(false); }}
      >
        {open && (
          <div className="p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-teal-dark">Book now</p>
                <h3 className="text-xl font-extrabold">{title}</h3>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="rounded-full px-3 py-1 text-lg font-bold ring-1 ring-ink/20 hover:bg-mist">✕</button>
            </div>
            <PaymentFlow cardEnabled={cardEnabled} project={title} demoSlug={slug} price={price} />
          </div>
        )}
      </dialog>
    </>
  );
}
