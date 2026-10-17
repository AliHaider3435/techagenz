import { useEffect, useRef } from "react";

/**
 * NeuralOrb — a looping, procedurally-animated glowing particle sphere
 * meant as a drop-in replacement for the AI vision video background.
 *
 * Usage (inside AIVision(), in place of the <video> element):
 *
 *   <NeuralOrb className="absolute inset-0 h-full w-full opacity-90" />
 *
 * No video file, no loop/duration issues — it's a continuous
 * requestAnimationFrame loop, so it never "runs out" and freezes.
 */

type Particle = {
  theta: number; // azimuthal angle on the sphere
  phi: number; // polar angle on the sphere
  r: number; // sphere radius factor (slight jitter for depth)
};

const PARTICLE_COUNT = 52;
const CONNECT_DISTANCE = 90; // px, in projected space
const MAX_CONNECTION_DISTANCE_SQUARED = CONNECT_DISTANCE * CONNECT_DISTANCE;
const ROTATION_SPEED = 0.00018; // radians per ms

// brand blue — matches oklch(0.7 0.19 240) used elsewhere in the site
const NODE_COLOR = "rgba(96, 165, 250, OPACITY)";
const LINE_COLOR = "rgba(56, 130, 246, OPACITY)";

export function NeuralOrb({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const particles: Particle[] = Array.from({ length: PARTICLE_COUNT }, () => ({
      theta: Math.random() * Math.PI * 2,
      phi: Math.acos(2 * Math.random() - 1),
      r: 0.85 + Math.random() * 0.15,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    let rotation = 0;
    let last = performance.now();
    let isIntersecting = false;
    let isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf: number | undefined;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const sphereRadius = Math.min(width, height) * 0.32;

      // project particles to 2D with simple perspective + depth for sizing/opacity
      const projected = particles.map((p) => {
        const theta = p.theta + rotation;
        const x3 = Math.sin(p.phi) * Math.cos(theta) * p.r;
        const y3 = Math.cos(p.phi) * p.r;
        const z3 = Math.sin(p.phi) * Math.sin(theta) * p.r;

        const perspective = 1 / (1.8 - z3); // z3 in [-1,1] -> perspective in ~[0.35,1.25]
        const x2 = cx + x3 * sphereRadius * perspective;
        const y2 = cy + y3 * sphereRadius * perspective;
        const depth = (z3 + 1) / 2; // 0 (far) .. 1 (near)

        return { x2, y2, depth };
      });

      // connecting lines between nearby particles
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const a = projected[i];
          const b = projected[j];
          const dx = a.x2 - b.x2;
          const dy = a.y2 - b.y2;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared < MAX_CONNECTION_DISTANCE_SQUARED) {
            const dist = Math.sqrt(distanceSquared);
            const avgDepth = (a.depth + b.depth) / 2;
            const opacity = (1 - dist / CONNECT_DISTANCE) * avgDepth * 0.35;
            if (opacity <= 0.01) continue;
            ctx.strokeStyle = LINE_COLOR.replace("OPACITY", opacity.toFixed(3));
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x2, a.y2);
            ctx.lineTo(b.x2, b.y2);
            ctx.stroke();
          }
        }
      }

      // nodes, drawn after lines so they sit on top; glow via shadowBlur
      for (const p of projected) {
        const size = 1 + p.depth * 2.2;
        const opacity = 0.25 + p.depth * 0.75;
        ctx.beginPath();
        ctx.fillStyle = NODE_COLOR.replace("OPACITY", opacity.toFixed(3));
        ctx.shadowColor = "rgba(96, 165, 250, 0.9)";
        ctx.shadowBlur = 6 + p.depth * 10;
        ctx.arc(p.x2, p.y2, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };

    const ro = new ResizeObserver(() => {
      resize();
      if (raf === undefined) draw();
    });
    ro.observe(canvas);

    const shouldAnimate = () =>
      isIntersecting && !document.hidden && !isReducedMotion;

    const tick = (now: number) => {
      raf = undefined;
      if (!shouldAnimate()) return;

      rotation += (now - last) * ROTATION_SPEED;
      last = now;
      draw();
      raf = requestAnimationFrame(tick);
    };

    const updateAnimation = () => {
      if (shouldAnimate()) {
        if (raf === undefined) {
          last = performance.now();
          raf = requestAnimationFrame(tick);
        }
      } else if (raf !== undefined) {
        cancelAnimationFrame(raf);
        raf = undefined;
      }
    };

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      updateAnimation();
    });
    observer.observe(canvas);
    const onVisibilityChange = () => updateAnimation();
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionPreferenceChange = (event: MediaQueryListEvent) => {
      isReducedMotion = event.matches;
      updateAnimation();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionPreference.addEventListener("change", onMotionPreferenceChange);

    draw();

    return () => {
      if (raf !== undefined) cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionPreference.removeEventListener("change", onMotionPreferenceChange);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}