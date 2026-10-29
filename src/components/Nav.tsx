import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
import logo from "@/assets/logo.webp?no-inline";
import BouncyButton from "@/components/BouncyButton";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "About", to: "/about" },
  { label: "Work", to: "/work" },
  { label: "Blogs", to: "/blogs" },
  { label: "Contact", to: "/contact" },
];

function Nav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="glass-card flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-1.5 sm:px-6 relative">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Tech Agenz" className="h-16 w-16 object-contain" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 text-sm text-muted-foreground lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              activeProps={{
                className: "text-brand font-semibold bg-brand/10 shadow-sm shadow-brand/10",
              }}
              className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-brand/10 hover:text-foreground"
            >
              [ {item.label} ]
            </Link>
          ))}
        </nav>

        {/* Right CTA Button & Mobile Toggle */}
        <div className="flex items-center gap-2">
          <BouncyButton
            href="/contact"
            className="glow-brand hidden rounded-full bg-brand px-5 py-2 text-sm font-medium text-primary-foreground sm:inline-flex"
          >
            Contact
          </BouncyButton>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/80 bg-background/80 text-foreground transition-colors hover:bg-card lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="glass-card absolute left-0 right-0 top-full mt-3 flex flex-col gap-2 rounded-3xl border border-brand/30 bg-background/95 p-6 shadow-2xl backdrop-blur-2xl lg:hidden">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                activeOptions={{ exact: item.to === "/" }}
                activeProps={{
                  className: "text-brand font-semibold bg-brand/10",
                }}
                className="flex items-center justify-between rounded-2xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-brand/10 hover:text-foreground"
              >
                <span>[ {item.label} ]</span>
                <ArrowUpRight className="h-4 w-4 opacity-50" />
              </Link>
            ))}
            <div className="mt-2 border-t border-border/60 pt-3">
              <Link
                to="/contact"
                onClick={() => setMobileMenuOpen(false)}
                className="glow-brand flex w-full items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Contact Us <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition"
              >
                <span>🔐 Team Portal Login</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

export default Nav;
