import { useEffect, useRef, useState } from "react";

export function TechCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isCoarse || prefersReducedMotion) return;

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;
    let raf: number | undefined;

    const move = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX - 4}px, ${mouseY - 4}px, 0)`;
      }
      if (raf === undefined) raf = requestAnimationFrame(loop);
    };

    const loop = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX - 20}px, ${ringY - 20}px, 0)`;
      }
      if (Math.abs(mouseX - ringX) > 0.1 || Math.abs(mouseY - ringY) > 0.1) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = undefined;
      }
    };

    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      setHovering(!!t.closest("a, button, [data-cursor='hover']"));
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    setEnabled(true);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
      if (raf !== undefined) cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full bg-brand shadow-[0_0_12px_var(--brand)] mix-blend-screen"
        aria-hidden
      />
      <div
        ref={ringRef}
        className={`pointer-events-none fixed left-0 top-0 z-[9998] h-10 w-10 rounded-full border transition-[transform,border-color,opacity] duration-200 ${
          hovering
            ? "scale-[1.4] border-brand-glow opacity-100"
            : "scale-100 border-brand/60 opacity-80"
        }`}
        style={{ boxShadow: "0 0 24px oklch(0.7 0.19 240 / 0.3)" }}
        aria-hidden
      >
        <div className="absolute inset-0 rounded-full border border-brand/20" />
        <div className="absolute -inset-1 rounded-full border border-dashed border-brand/30" />
      </div>
    </>
  );
}