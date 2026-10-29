import { Link } from "@tanstack/react-router";
import { Linkedin, Github } from "lucide-react";
import logo from "@/assets/logo.webp?no-inline";

function Footer() {
  return (
    <footer className="relative border-t border-border/50 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Tech Agenz — AI Automation & Software House in Pakistan"
              className="h-12 w-12 object-contain"
            />
            <span className="font-display text-lg font-semibold">Tech Agenz</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
            AI-powered software house based in Pakistan engineering intelligent solutions,
            WhatsApp business automation, ERPNext systems, and custom web platforms for ambitious
            teams worldwide.
          </p>
          <div className="mt-3 text-xs text-brand font-medium">
            Based in Pakistan • Serving Clients Globally
          </div>
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
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            Specialized Services
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link
                to="/services"
                hash="business-automation"
                className="hover:text-brand transition-colors"
              >
                Smart Business Automation
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                hash="whatsapp-automation"
                className="hover:text-brand transition-colors"
              >
                WhatsApp Automation
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                hash="ai-chatbots"
                className="hover:text-brand transition-colors"
              >
                AI Chatbot Development
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                hash="custom-software"
                className="hover:text-brand transition-colors"
              >
                Custom Software Development
              </Link>
            </li>
            <li>
              <Link to="/services" hash="erpnext" className="hover:text-brand transition-colors">
                ERPNext Implementation
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Navigation</div>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-brand transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-brand transition-colors">
                Services & FAQs
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-brand transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/work" className="hover:text-brand transition-colors">
                Case Studies
              </Link>
            </li>
            <li>
              <Link to="/blogs" className="hover:text-brand transition-colors">
                Engineering Blog
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-brand transition-colors">
                Contact & Discovery
              </Link>
            </li>
            <li className="pt-2 border-t border-border/30">
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium flex items-center gap-1.5">
                <span>🔐 Team Portal Login</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-7xl flex-col items-start justify-between gap-3 border-t border-border/50 px-6 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <div>
          © {new Date().getFullYear()} Tech Agenz. All rights reserved. • Pakistan •{" "}
          <Link to="/login" className="text-cyan-400 hover:underline">
            Team Portal
          </Link>
        </div>
        <div className="flex gap-6">
          <a href="mailto:info@techagenz.com" className="hover:text-brand">
            info@techagenz.com
          </a>
          <a href="tel:+923394555004" className="hover:text-brand">
            +92 339 4555004
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
