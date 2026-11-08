"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Loads and autoplays (muted) when the visitor scrolls the video into view, pauses when it leaves.
 * Nothing is downloaded until then, so the page stays fast.
 */
export default function LazyVideo({ src, poster, label }: { src: string; poster?: string; label: string }) {
  const box = useRef<HTMLDivElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        if (e.isIntersecting) setMounted(true);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = vid.current;
    if (!v) return;
    if (visible) v.play().catch(() => {});
    else v.pause();
  }, [visible, mounted]);

  return (
    <div ref={box} className="aspect-video w-full bg-ink">
      {mounted ? (
        <video ref={vid} controls muted loop playsInline autoPlay poster={poster} aria-label={label} className="h-full w-full">
          <source src={src} type="video/webm" />
        </video>
      ) : (
        poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt="" loading="lazy" decoding="async" width={1280} height={720} className="h-full w-full object-cover object-top" />
        )
      )}
    </div>
  );
}
