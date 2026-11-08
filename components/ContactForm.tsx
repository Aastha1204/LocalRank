"use client";
import { useState } from "react";
import { BUSINESS_TYPES } from "@/config/site";

type State = "idle" | "sending" | "done" | "error";

export default function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(fd.entries())),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please WhatsApp me instead.");
      setState("done");
    } catch (err) {
      setError((err as Error).message);
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="card p-8 text-center" role="status">
        <p className="text-2xl font-extrabold">Thank you! Your message has been received.</p>
        <p className="mt-2 text-ink/80">I’ll reply within 24 hours. For a faster answer, WhatsApp me.</p>
      </div>
    );
  }

  const field = "mt-1 w-full rounded-xl border border-ink/20 bg-white px-4 py-3";
  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-6 sm:p-8">
      {/* honeypot: hidden from people, bots fill it */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
      </div>
      <label className="block text-sm font-bold">
        Your name
        <input name="name" required maxLength={80} autoComplete="name" className={field} />
      </label>
      <label className="block text-sm font-bold">
        Phone number
        <input name="phone" required type="tel" inputMode="tel" maxLength={20} autoComplete="tel" className={field} />
      </label>
      <label className="block text-sm font-bold">
        Business type
        <select name="business_type" required defaultValue="" className={field}>
          <option value="" disabled>Choose one</option>
          {BUSINESS_TYPES.map((b) => <option key={b}>{b}</option>)}
        </select>
      </label>
      <label className="block text-sm font-bold">
        Message (optional)
        <textarea name="message" rows={3} maxLength={1000} className={field} />
      </label>
      {state === "error" && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
      <button type="submit" disabled={state === "sending"} className="btn btn-primary w-full disabled:opacity-60">
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
      <p className="text-center text-xs text-ink/70">I reply within 24 hours. Your details are used only to contact you.</p>
    </form>
  );
}
