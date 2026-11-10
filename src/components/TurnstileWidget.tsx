import { useEffect, useRef } from "react";

interface TurnstileApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ): string;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

interface TurnstileWidgetProps {
  onToken: (token: string) => void;
  onError: () => void;
  resetSignal: number;
}

const SCRIPT_ID = "cloudflare-turnstile-script";
let scriptPromise: Promise<void> | undefined;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  const pending = new Promise<void>((resolve, reject) => {
    let script = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    const handleLoad = () => {
      if (window.turnstile) resolve();
      else reject(new Error("Turnstile did not initialize."));
    };
    const handleError = () => reject(new Error("Turnstile could not be loaded."));

    if (!script) {
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
    }

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });
    if (!script.isConnected) document.head.appendChild(script);
  }).catch((error: unknown) => {
    scriptPromise = undefined;
    throw error;
  });

  scriptPromise = pending;
  return pending;
}

export function TurnstileWidget({ onToken, onError, resetSignal }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onError);
  const siteKey = import.meta.env.VITE_CF_TURNSTILE_SITE_KEY?.trim() ?? "";

  onTokenRef.current = onToken;
  onErrorRef.current = onError;

  useEffect(() => {
    if (!siteKey || !containerRef.current) return;

    let disposed = false;
    let widgetId: string | undefined;

    loadTurnstile()
      .then(() => {
        if (disposed || !containerRef.current || !window.turnstile) return;
        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(""),
          "error-callback": () => {
            onTokenRef.current("");
            onErrorRef.current();
          },
        });
      })
      .catch(() => {
        if (!disposed) onErrorRef.current();
      });

    return () => {
      disposed = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
      onTokenRef.current("");
    };
  }, [siteKey, resetSignal]);

  if (!siteKey) {
    return (
      <p className="text-sm text-amber-500" role="status">
        Secure form verification is not configured. Please contact us directly.
      </p>
    );
  }

  return <div ref={containerRef} aria-label="Cloudflare Turnstile verification" />;
}
