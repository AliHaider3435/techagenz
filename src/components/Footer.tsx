import { Link } from "@tanstack/react-router";
import { Linkedin, Github, Mail, Phone, MessageCircle } from "lucide-react";
import logo from "@/assets/logo.webp?no-inline";
import { siteConfig } from "@/content";

const whatsappUrl = `https://wa.me/${siteConfig.contact.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hi, I'd like to discuss a project with Tech Agenz.")}`;

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative border-t border-border/50 py-14"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto grid max-w-7xl gap-10 px-6 md:grid-cols-4">
        {/* Brand column */}
        <div className="md:col-span-2">
          <Link
            to="/"
            className="inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded-lg"
            aria-label="Tech Agenz — Home"
          >
            <img
              src={logo}
              alt="Tech Agenz logo"
              width={48}
              height={48}
              loading="lazy"
              decoding="async"
              className="h-12 w-12 object-contain"
            />
            <span className="font-display text-lg font-semibold">Tech Agenz</span>
          </Link>

          <p className="mt-4 max-w-sm text-sm text-muted-foreground leading-relaxed">
            AI-powered software house building intelligent automation, WhatsApp business solutions,
            custom software, and enterprise platforms for ambitious teams worldwide.
          </p>

          <div className="mt-2 text-xs text-brand font-medium">
            Pakistan-based · Serving clients in US, UK, UAE, Canada &amp; beyond
          </div>

          {/* Trust badges */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border/50 bg-white p-2">
              <img
                src="/PSEB.png"
                alt="PSEB — Pakistan Software Export Board registered company"
                width={112}
                height={56}
                loading="lazy"
                decoding="async"
                className="h-14 w-28 object-contain"
              />
              <span className="text-[10px] font-medium text-slate-700">PSEB Registered</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-lg border border-border/50 bg-white p-2">
              <img
                src="/aws-logo.png"
                alt="AWS — Amazon Web Services cloud infrastructure partner"
                width={112}
                height={56}
                loading="lazy"
                decoding="async"
                className="h-14 w-28 object-contain"
              />
              <span className="text-[10px] font-medium text-slate-700">AWS Cloud</span>
            </div>
          </div>

          {/* Social links */}
          <div className="mt-6 flex gap-3" aria-label="Social media links">
            <a
              href={siteConfig.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Connect with Tech Agenz on LinkedIn (opens in new tab)"
              className="glass-card flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-brand/10 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Linkedin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </a>
            <a
              href={siteConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Tech Agenz on GitHub (opens in new tab)"
              className="glass-card flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-brand/10 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <Github className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </a>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat with Tech Agenz on WhatsApp (opens in new tab)"
              className="glass-card flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-brand/10 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <MessageCircle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Services column */}
        <nav aria-label="Services navigation">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Our Services
          </div>
          <ul className="mt-4 space-y-2.5 text-sm" role="list">
            <li>
              <Link
                to="/services"
                hash="business-automation"
                className="text-muted-foreground hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
              >
                AI Business Automation
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                hash="whatsapp-automation"
                className="text-muted-foreground hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
              >
                WhatsApp AI Agents
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                hash="ai-chatbots"
                className="text-muted-foreground hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
              >
                AI Chatbot Development
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                hash="custom-software"
                className="text-muted-foreground hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
              >
                Custom Software Development
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                hash="web-dev"
                className="text-muted-foreground hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
              >
                Web Application Development
              </Link>
            </li>
            <li>
              <Link
                to="/services"
                hash="erpnext"
                className="text-muted-foreground hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
              >
                ERPNext Implementation
              </Link>
            </li>
          </ul>
        </nav>

        {/* Navigation column */}
        <nav aria-label="Site navigation">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Company
          </div>
          <ul className="mt-4 space-y-2.5 text-sm" role="list">
            <li>
              <Link
                to="/about"
                className="text-muted-foreground hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                to="/industries"
                className="text-muted-foreground hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
              >
                Industries
              </Link>
            </li>
            <li>
              <Link
                to="/work"
                className="text-muted-foreground hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
              >
                Case Studies
              </Link>
            </li>
            <li>
              <Link
                to="/blogs"
                className="text-muted-foreground hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
              >
                Engineering Blog
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="text-muted-foreground hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
              >
                Contact &amp; Discovery
              </Link>
            </li>
          </ul>

          {/* Contact info */}
          <div className="mt-6 space-y-2">
            <a
              href={`mailto:${siteConfig.contact.email}`}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-brand transition-colors"
              aria-label={`Email Tech Agenz at ${siteConfig.contact.email}`}
            >
              <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{siteConfig.contact.email}</span>
            </a>
            <a
              href={`tel:${siteConfig.contact.phone}`}
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-brand transition-colors"
              aria-label={`Call Tech Agenz at ${siteConfig.contact.displayPhone}`}
            >
              <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{siteConfig.contact.displayPhone}</span>
            </a>
          </div>
        </nav>
      </div>

      {/* Bottom bar */}
      <div className="mx-auto mt-10 flex max-w-7xl flex-col items-start justify-between gap-3 border-t border-border/50 px-6 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <div>
          &copy; {year} Tech Agenz. All rights reserved. &bull;{" "}
          <Link
            to="/privacy"
            className="hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
          >
            Privacy Policy
          </Link>{" "}
          &bull;{" "}
          <Link
            to="/terms"
            className="hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand rounded"
          >
            Terms of Service
          </Link>
        </div>
        <div className="text-muted-foreground/70">
          Engineered in Pakistan &mdash; Delivered Globally
        </div>
      </div>
    </footer>
  );
}

export default Footer;
