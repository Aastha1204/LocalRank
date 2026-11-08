import Image from "next/image";
import fs from "node:fs";
import path from "node:path";
import type { Demo } from "@/config/site";

function has(file: string) {
  return fs.existsSync(path.join(process.cwd(), "public", file));
}

export function demoShots(demo: Demo) {
  const d = `${demo.image}-desktop.webp`;
  const m = `${demo.image}-mobile.webp`;
  return { desktop: has(d) ? d : null, mobile: has(m) ? m : null };
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink via-ink-soft to-teal-dark p-6 text-center">
      <span className="text-lg font-bold text-white">{title}</span>
    </div>
  );
}

/** Browser frame with desktop screenshot + small phone overlay. Falls back to a gradient placeholder. */
export default function DemoVisual({ demo, priority = false }: { demo: Demo; priority?: boolean }) {
  const { desktop, mobile } = demoShots(demo);
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-xl border border-ink/10 bg-white shadow-xl">
        <div className="flex items-center gap-1.5 border-b border-ink/10 bg-mist px-3 py-2" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b5e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f5c04a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#4cc16b]" />
          <span className="ml-3 truncate rounded-md bg-white px-2 py-0.5 text-[10px] text-ink/80">{demo.url.replace("https://", "")}</span>
        </div>
        <div className="aspect-[1280/800] w-full">
          {desktop ? (
            <Image
              src={desktop}
              alt={`${demo.title} demo on desktop (${demo.industry}, sample data)`}
              width={1280}
              height={800}
              sizes="(min-width: 1024px) 560px, 92vw"
              priority={priority}
              loading={priority ? undefined : "lazy"}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <Placeholder title={demo.title} />
          )}
        </div>
      </div>
      <div className="absolute -bottom-5 -right-2 w-[24%] min-w-[78px] overflow-hidden rounded-[1.1rem] border-[5px] border-ink bg-ink shadow-2xl sm:-right-4">
        <div className="aspect-[390/844] w-full">
          {mobile ? (
            <Image
              src={mobile}
              alt={`${demo.title} demo on a phone`}
              width={390}
              height={844}
              sizes="140px"
              priority={priority}
              loading={priority ? undefined : "lazy"}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-b from-teal-dark to-ink" />
          )}
        </div>
      </div>
    </div>
  );
}

