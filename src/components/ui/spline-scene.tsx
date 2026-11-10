import { useEffect, useRef, type CSSProperties } from "react";

// Use @splinetool/runtime directly (NOT react-spline) so Spline's WebGL
// animation loop runs outside React's reconciler — no deep Hu/Vu call stacks.
type SplineApp = import("@splinetool/runtime").Application;

interface SplineSceneProps {
  scene: string;
  className?: string;
  style?: CSSProperties;
  onLoad?: (app: SplineApp) => void;
}

type ThreeNode = {
  isMesh?: boolean;
  material?: ThreeMaterial | ThreeMaterial[];
  traverse?: (cb: (node: ThreeNode) => void) => void;
};

type ThreeMaterial = {
  color?: { set?: (c: string) => void };
  emissive?: { set?: (c: string) => void };
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
};

type SplineInternal = {
  scene?: ThreeNode;
  canvas?: HTMLElement & { style: CSSStyleDeclaration };
  _renderer?: {
    setClearColor?: (c: number, a: number) => void;
    setClearAlpha?: (a: number) => void;
  };
  _scene?: { activePage?: { background: null } };
  setBackgroundColor?: (color: string) => void;
};

function applyThemeToSpline(app: SplineApp) {
  const threeScene = (app as SplineInternal).scene;
  if (!threeScene || typeof threeScene.traverse !== "function") return;

  const accentColor = "#22d3ee";
  const accentGlow = "#4f46e5";

  threeScene.traverse((node: ThreeNode) => {
    if (!node?.isMesh) return;
    const applyMat = (mat: ThreeMaterial | undefined) => {
      if (!mat) return;
      mat.color?.set?.(accentColor);
      mat.emissive?.set?.(accentGlow);
      if (typeof mat.emissiveIntensity === "number") mat.emissiveIntensity = 0.35;
      if (typeof mat.metalness === "number") mat.metalness = 0.8;
      if (typeof mat.roughness === "number") mat.roughness = 0.2;
    };
    if (Array.isArray(node.material)) {
      node.material.forEach(applyMat);
    } else {
      applyMat(node.material);
    }
  });
}

function makeTransparent(app: SplineApp) {
  try {
    const a = app as SplineInternal;
    if (a.canvas) {
      a.canvas.style.background = "transparent";
      a.canvas.style.backgroundColor = "transparent";
    }
    a._renderer?.setClearColor?.(0x000000, 0);
    a._renderer?.setClearAlpha?.(0);
    if (typeof a.setBackgroundColor === "function") a.setBackgroundColor("transparent");
    if (a._scene?.activePage) a._scene.activePage.background = null;
  } catch {
    // safe – internal Spline API may change
  }
}

export function SplineScene({ scene, className, style, onLoad }: SplineSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appRef = useRef<SplineApp | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;

    // Dynamically import the runtime — keeps it out of the initial bundle
    import("@splinetool/runtime").then(({ Application }) => {
      if (cancelled) return;

      const app = new Application(canvas, {
        // Transparent WebGL context so site's background shows through
        renderOnDemand: false,
      });

      appRef.current = app;

      app
        .load(scene)
        .then(() => {
          if (cancelled) return;
          makeTransparent(app);
          applyThemeToSpline(app);
          // Second pass after a tick in case Spline re-applies its own background
          window.setTimeout(() => {
            if (!cancelled) {
              makeTransparent(app);
            }
          }, 250);
          onLoad?.(app);
        })
        .catch((err: unknown) => {
          // Suppress non-critical load errors (e.g. network abort on unmount)
          if (!cancelled) console.warn("[SplineScene] load error:", err);
        });
    });

    return () => {
      cancelled = true;
      try {
        appRef.current?.dispose?.();
      } catch {
        // ignore dispose errors
      }
      appRef.current = null;
    };
    // scene URL is intentionally a stable string — no need to re-run on re-renders
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        background: "transparent",
        ...style,
      }}
      aria-label="Interactive 3D robot animation"
    />
  );
}
