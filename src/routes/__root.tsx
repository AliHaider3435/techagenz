import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/orbitron";
import "@fontsource-variable/sora";
import heroFont from "@fontsource-variable/orbitron/files/orbitron-latin-wght-normal.woff2?url";
import logo from "@/assets/logo.webp?no-inline";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: any; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    console.error("[root error boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-20 text-center">
      <div className="mx-auto max-w-md rounded-3xl border border-border/60 bg-card/60 p-8 shadow-xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
          <span className="text-2xl">!</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Something went wrong</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          {error?.message || "An unexpected error occurred while loading this view. Please try again or return home."}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-border bg-background/80 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-card"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const organizationSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Tech Agenz",
  url: "https://www.techagenz.com",
  logo: `https://www.techagenz.com${logo}`,
  description:
    "AI-powered software house engineering intelligent solutions, automation pipelines, and modern web platforms.",
  telephone: "+923394555004",
  sameAs: [
    "https://www.linkedin.com/in/haider5617/",
    "https://github.com/AliHaider3435",
  ],
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Tech Agenz — AI-Powered Software House" },
      {
        name: "description",
        content:
          "Tech Agenz builds intelligent AI, automation, and web solutions that scale. 50+ projects delivered across 7+ countries.",
      },
      { name: "author", content: "Tech Agenz" },
      { property: "og:site_name", content: "Tech Agenz" },
      { property: "og:title", content: "Tech Agenz — AI-Powered Software House" },
      {
        property: "og:description",
        content:
          "Intelligent AI, automation, and web solutions built for ambitious teams. 50+ projects delivered worldwide.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.techagenz.com/" },
      { property: "og:image", content: `https://www.techagenz.com${logo}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Tech Agenz — AI-Powered Software House" },
      {
        name: "twitter:description",
        content:
          "Intelligent AI, automation, and web solutions built for ambitious teams. 50+ projects delivered worldwide.",
      },
      { name: "twitter:image", content: `https://www.techagenz.com${logo}` },
    ],
    links: [
      { rel: "canonical", href: "https://www.techagenz.com/" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preload",
        href: heroFont,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "icon", href: logo, type: "image/webp" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationSchema }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Analytics />
    </QueryClientProvider>
  );
}