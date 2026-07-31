import { Link } from "@tanstack/react-router";
import logo from "@/assets/logo.png";
import BouncyButton from "@/components/BouncyButton";

function Nav() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="glass-card flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-1.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="Tech Agenz" className="h-18 w-18 object-contain" />
        </Link>
        <nav className="hidden items-center gap-1 text-sm text-muted-foreground md:flex">
          {[
            ["Home", "/"],
            ["Services", "/#services"],
            ["About", "/#about"],
            ["Work", "/work"],
            ["Contact", "/#contact"],
          ].map(([label, href]) => (
            <a
              key={label}
              href={href}
              className="rounded-full px-4 py-1.5 transition-colors hover:bg-brand/10 hover:text-foreground"
            >
              [ {label} ]
            </a>
          ))}
        </nav>
        <BouncyButton
          href="/#contact"
          className="glow-brand hidden rounded-full bg-brand px-5 py-2 text-sm font-medium text-primary-foreground sm:inline-flex"
        >
          Contact
        </BouncyButton>
      </div>
    </header>
  );
}

export default Nav;