import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Analytics } from "@vercel/analytics/react";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import heroFont from "@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2?url";
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

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    console.error("[root error boundary]", error);
  }, [error]);

  const errorMessage =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "An unexpected error occurred while loading this view. Please try again or return home.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-20 text-center">
      <div className="mx-auto max-w-md rounded-3xl border border-border/60 bg-card/60 p-8 shadow-xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
          <span className="text-2xl">!</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground">Something went wrong</h2>
        <p className="mt-3 text-sm text-muted-foreground">{errorMessage}</p>
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

const localBusinessSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": ["ProfessionalService", "LocalBusiness"],
  name: "Tech Agenz",
  url: "https://techagenz.com",
  logo: `https://techagenz.com${logo}`,
  image: "https://techagenz.com/og-image.jpg",
  description:
    "Tech Agenz is an AI automation and custom software house in Pakistan specializing in WhatsApp automation, ERPNext implementation, AI chatbot development, and bespoke web platforms.",
  telephone: "+923394555004",
  email: "info@techagenz.com",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Tech Agenz Headquarters",
    addressLocality: "Pakistan",
    addressRegion: "Pakistan",
    postalCode: "54000",
    addressCountry: "PK",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "31.5204",
    longitude: "74.3587",
  },
  areaServed: [
    { "@type": "Country", name: "Pakistan" },
    { "@type": "Country", name: "United States" },
    { "@type": "Country", name: "United Kingdom" },
    { "@type": "Country", name: "United Arab Emirates" },
    { "@type": "Country", name: "Saudi Arabia" },
  ],
  priceRange: "$$",
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "09:00",
      closes: "19:00",
    },
  ],
  sameAs: ["https://www.linkedin.com/in/haider5617/", "https://github.com/AliHaider3435"],
});

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        name: "google-adsense-account",
        content: "ca-pub-2324408013770466",
      },
      { title: "Tech Agenz — AI-Powered Software House in Pakistan" },
      {
        name: "description",
        content:
          "Tech Agenz is an AI automation and custom software house in Pakistan helping businesses simplify operations, automate workflows, and build smarter digital experiences with WhatsApp Automation & ERPNext.",
      },
      { name: "author", content: "Tech Agenz" },
      { property: "og:site_name", content: "Tech Agenz" },
      { property: "og:title", content: "Tech Agenz — AI-Powered Software House in Pakistan" },
      {
        property: "og:description",
        content:
          "AI automation and custom software development in Pakistan: WhatsApp automation, ERPNext implementation, and bespoke enterprise platforms.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://techagenz.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Tech Agenz — AI-Powered Software House in Pakistan" },
      {
        name: "twitter:description",
        content:
          "AI automation, WhatsApp business solutions, ERPNext systems, and custom software engineered for ambitious teams worldwide.",
      },
      { name: "twitter:image", content: "https://techagenz.com/og-image.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Preload hero font
      {
        rel: "preload",
        href: heroFont,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "icon", href: logo, type: "image/webp" },
      // DNS-prefetch for AdSense
      { rel: "dns-prefetch", href: "https://pagead2.googlesyndication.com" },
      // DNS-prefetch for Vercel Analytics
      { rel: "dns-prefetch", href: "https://vitals.vercel-insights.com" },
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
          dangerouslySetInnerHTML={{ __html: localBusinessSchema }}
        />
        {/* Official Google AdSense script tag for automated site review & ad serving */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2324408013770466"
          crossOrigin="anonymous"
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
