import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://techagenz.com/",
      },
      ...items.map((item, idx) => ({
        "@type": "ListItem",
        position: idx + 2,
        name: item.label,
        ...(item.to ? { item: `https://techagenz.com${item.to}` } : {}),
      })),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav
        aria-label="Breadcrumb"
        className={`inline-flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground ${className}`}
      >
        <Link
          to="/"
          className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          aria-label="Home"
        >
          <Home className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Home</span>
        </Link>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <span key={item.label} className="inline-flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 opacity-50" aria-hidden="true" />
              {item.to && !isLast ? (
                <Link
                  to={item.to}
                  className="rounded px-1.5 py-0.5 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="px-1.5 py-0.5 font-medium text-foreground"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
            </span>
          );
        })}
      </nav>
    </>
  );
}
