"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Memunculkan konten dengan fade + geser saat pertama kali masuk layar.
 * Konten tetap terlihat tanpa JS, untuk yang sudah di layar saat dimuat, dan saat reduced-motion.
 */
export function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    el.dataset.reveal = "hidden";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        delete el.dataset.reveal;
        observer.disconnect();
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="transition duration-700 ease-out data-[reveal=hidden]:translate-y-8 data-[reveal=hidden]:opacity-0"
    >
      {children}
    </div>
  );
}
