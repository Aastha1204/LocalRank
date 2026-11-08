"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { ILLUSTRATIONS, type IllustrationKey } from "./Illustrations";
import { BookIcon, BotIcon, ChatIcon, GearIcon, GlobeIcon, ListIcon, PhoneIcon, SparkIcon, WhatsAppIcon } from "./Icons";

const ICONS = { globe: GlobeIcon, chat: ChatIcon, whatsapp: WhatsAppIcon, list: ListIcon, phone: PhoneIcon, spark: SparkIcon, book: BookIcon, bot: BotIcon, gear: GearIcon };

export type Work = { title: string; text: string; icon: keyof typeof ICONS; desktop: string | null; illustration?: IllustrationKey };

// Thumbnails mount after the page has settled so they never compete with the headline for bandwidth.
const Ready = createContext(false);

function Card({ w }: { w: Work }) {
  const Icon = ICONS[w.icon];
  const ready = useContext(Ready);
  return (
    <li className="w-64 shrink-0 rounded-2xl bg-white p-3 shadow-md ring-1 ring-ink/10 sm:w-72">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-mist ring-1 ring-ink/10 [container-type:inline-size]">
        {w.illustration ? (
          (() => { const Ill = ILLUSTRATIONS[w.illustration]; return <Ill />; })()
        ) : w.desktop && ready ? (
          <Image src={w.desktop} alt="" width={400} height={250} sizes="288px" loading="eager" fetchPriority="low" className="h-full w-full object-cover object-top" />
        ) : null}
      </div>
      <span className="mt-3 flex h-8 w-8 items-center justify-center rounded-lg bg-saffron text-ink"><Icon /></span>
      <h3 className="mt-2 font-extrabold">{w.title}</h3>
      <p className="mt-1 text-sm text-ink/80">{w.text}</p>
    </li>
  );
}

export default function WorkCarousel({ works }: { works: Work[] }) {
  const [paused, setPaused] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1500);
    return () => clearTimeout(t);
  }, []);
  return (
    <section aria-label="What I build" className="border-b border-ink/10 bg-mist py-5">
      <div className="wrap mb-3 flex items-center justify-between px-4">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-teal-dark">What I build for you</h2>
        <button type="button" onClick={() => setPaused((p) => !p)} aria-pressed={paused} className="rounded-full px-3 py-1 text-xs font-bold ring-1 ring-ink/25 hover:bg-white">
          {paused ? "Play" : "Pause"}
        </button>
      </div>
    <Ready.Provider value={ready}>
      <div className="work-marquee overflow-hidden" data-paused={paused}>
        <div className="work-track">
          <ul className="flex gap-4 pr-4">
            {works.map((w) => <Card key={w.title} w={w} />)}
          </ul>
          <ul className="flex gap-4 pr-4" aria-hidden="true">
            {works.map((w) => <Card key={w.title} w={w} />)}
          </ul>
        </div>
      </div>
    </Ready.Provider>
    </section>
  );
}
