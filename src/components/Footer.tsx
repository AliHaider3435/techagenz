import { Link } from "@tanstack/react-router";
import { Linkedin, Github } from "lucide-react";
import logo from "@/assets/logo.webp?no-inline";

function Footer() {
  return (
    <footer className="relative border-t border-border/50 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="" className="h-12 w-12 object-contain" />
            <span className="font-display text-lg font-semibold">Tech Agenz</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            An AI-powered software house helping businesses simplify complex operations, automate repetitive tasks, and build smarter digital experiences.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              href="https://www.linkedin.com/in/haider5617/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="glass-card flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-brand/10 hover:text-brand"
            >
              <Linkedin className="h-4 w-4 text-muted-foreground transition-colors hover:text-brand" />
            </a>
            <a
              href="https://github.com/AliHaider3435"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="glass-card flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-brand/10 hover:text-brand"
            >
              <Github className="h-4 w-4 text-muted-foreground transition-colors hover:text-brand" />
            </a>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Services</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/services" className="hover:text-brand">Smart Business Automation</Link></li>
            <li><Link to="/services" className="hover:text-brand">WhatsApp Automation</Link></li>
            <li><Link to="/services" className="hover:text-brand">AI Chatbot Development</Link></li>
            <li><Link to="/services" className="hover:text-brand">Custom Software</Link></li>
            <li><Link to="/services" className="hover:text-brand">ERPNext Implementation</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Navigation</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/" className="hover:text-brand">Home</Link></li>
            <li><Link to="/services" className="hover:text-brand">Services</Link></li>
            <li><Link to="/about" className="hover:text-brand">About</Link></li>
            <li><Link to="/work" className="hover:text-brand">Work</Link></li>
            <li><Link to="/blogs" className="hover:text-brand">Blogs</Link></li>
            <li><Link to="/contact" className="hover:text-brand">Contact</Link></li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col items-start justify-between gap-3 border-t border-border/50 px-6 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <div>© {new Date().getFullYear()} Tech Agenz. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="mailto:info@techagenz.com" className="hover:text-brand">info@techagenz.com</a>
          <a href="tel:03394555004" className="hover:text-brand">03394555004</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;