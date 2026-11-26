import { Link, useLocation } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Menu, X, ArrowUpRight, Zap } from "lucide-react";
import logo from "@/assets/logo.webp?no-inline";
import BouncyButton from "@/components/BouncyButton";

const navItems = [
  { label: "Services", to: "/services" },
  { label: "Industries", to: "/industries" },
  { label: "Portfolio", to: "/work" },
  { label: "About", to: "/about" },
  { label: "Blog", to: "/blogs" },
];

function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Add subtle scroll state for glass intensity
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Skip to main content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4" role="banner">
        <div
          className={`glass-card flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-1.5 sm:px-6 relative transition-all duration-300 ${scrolled ? "shadow-lg shadow-brand/5" : ""}`}
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-full"
            aria-label="Tech Agenz — Home"
          >
            <img
              src={logo}
              alt="Tech Agenz"
              className="h-14 w-14 object-contain"
              width={56}
              height={56}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-1 text-sm text-muted-foreground lg:flex"
            aria-label="Primary navigation"
          >
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                activeOptions={{ exact: false }}
                activeProps={{
                  className: "text-brand font-semibold bg-brand/10 shadow-sm shadow-brand/10",
                  "aria-current": "page" as const,
                }}
                className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-brand/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right CTA Button & Mobile Toggle */}
          <div className="flex items-center gap-2">
            <BouncyButton
              href="/contact"
              className="glow-brand hidden items-center gap-1.5 rounded-full bg-brand px-5 py-2 text-sm font-semibold text-primary-foreground sm:inline-flex"
              aria-label="Book a discovery call with Tech Agenz"
            >
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              Book a Call
            </BouncyButton>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-background/80 text-foreground transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div
              id="mobile-navigation"
              role="navigation"
              aria-label="Mobile navigation"
              className="absolute left-0 right-0 top-full mt-3 flex flex-col gap-1 rounded-3xl border border-brand/50 bg-[#071426] p-5 text-slate-100 shadow-2xl shadow-black/60 ring-1 ring-white/10 lg:hidden"
            >
              {/* Mobile nav includes Home */}
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                activeOptions={{ exact: true }}
                activeProps={{
                  className: "text-brand font-semibold bg-brand/10",
                  "aria-current": "page" as const,
                }}
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-brand/10 hover:text-foreground"
              >
                <span>Home</span>
                <ArrowUpRight className="h-4 w-4 opacity-50" aria-hidden="true" />
              </Link>

              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  activeOptions={{ exact: false }}
                  activeProps={{
                    className: "text-brand font-semibold bg-brand/10",
                    "aria-current": "page" as const,
                  }}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-brand/10 hover:text-foreground"
                >
                  <span>{item.label}</span>
                  <ArrowUpRight className="h-4 w-4 opacity-50" aria-hidden="true" />
                </Link>
              ))}

              <div className="mt-2 border-t border-border/60 pt-3">
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="glow-brand flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                >
                  <Zap className="h-3.5 w-3.5" aria-hidden="true" />
                  Book a Discovery Call
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}

export default Nav;
