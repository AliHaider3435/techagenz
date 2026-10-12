import { Suspense, lazy, type CSSProperties } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
  style?: CSSProperties;
}

function applyThemeToSpline(app: unknown) {
  const splineApp = app as {
    scene?: {
      traverse?: (callback: (node: unknown) => void) => void;
    };
  };

  const scene = splineApp.scene;
  if (!scene || typeof scene.traverse !== "function") return;

  const accentColor = "#22d3ee";
  const accentGlow = "#4f46e5";

  const applyMaterialTheme = (material: unknown) => {
    if (!material || typeof material !== "object") return;

    const materialLike = material as {
      color?: { set?: (value: string) => void };
      emissive?: { set?: (value: string) => void };
      emissiveIntensity?: number;
      metalness?: number;
      roughness?: number;
    };

    if (materialLike.color?.set) materialLike.color.set(accentColor);
    if (materialLike.emissive?.set) materialLike.emissive.set(accentGlow);
    if (typeof materialLike.emissiveIntensity === "number") materialLike.emissiveIntensity = 0.35;
    if (typeof materialLike.metalness === "number") materialLike.metalness = 0.8;
    if (typeof materialLike.roughness === "number") materialLike.roughness = 0.2;
  };

  scene.traverse((node) => {
    if (!node || typeof node !== "object") return;
    const nodeLike = node as {
      isMesh?: boolean;
      material?: unknown;
    };

    if (!nodeLike.isMesh) return;

    if (Array.isArray(nodeLike.material)) {
      nodeLike.material.forEach((entry) => applyMaterialTheme(entry));
      return;
    }

    applyMaterialTheme(nodeLike.material);
  });
}

export function SplineScene({ scene, className, style }: SplineSceneProps) {
  const handleLoad = (app: unknown) => {
    applyThemeToSpline(app);
    window.setTimeout(() => applyThemeToSpline(app), 250);
  };

  return (
    <Suspense
      fallback={
        <div className="flex h-full w-full items-center justify-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
        </div>
      }
    >
      <Spline scene={scene} className={className} style={style} onLoad={handleLoad} />
    </Suspense>
  );
}
