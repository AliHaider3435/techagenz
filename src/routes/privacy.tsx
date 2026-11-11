import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  CheckCircle2,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { TechCursor } from "@/components/TechCursor";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Tech Agenz | AI & Software House" },
      {
        name: "description",
        content:
          "Read the official Privacy Policy of Tech Agenz. Learn how we collect, use, and protect your personal data, cookie usage, Google AdSense compliance, and your privacy rights.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Privacy Policy — Tech Agenz" },
      {
        property: "og:description",
        content: "Transparent data protection and privacy practices at Tech Agenz.",
      },
      { property: "og:url", content: "https://techagenz.com/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://techagenz.com/privacy" }],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  const lastUpdated = "October 30, 2026";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <TechCursor />
      <WhatsAppButton />
      <Nav />

      {/* Hero Header */}
      <section className="relative pt-36 pb-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.7 0.19 240 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.19 240 / 0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs uppercase tracking-widest text-brand">
            <Shield className="h-3.5 w-3.5" /> Legal & Transparency
          </div>
          <h1 className="font-hero mt-5 text-4xl font-bold uppercase sm:text-5xl">
            Privacy <span className="text-gradient-brand">Policy</span>
          </h1>
          <p className="mt-4 text-sm text-muted-foreground">
            Effective & Last Updated: <strong>{lastUpdated}</strong>
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="glass-card rounded-3xl border border-border/70 p-8 sm:p-12 space-y-10 text-foreground/90 leading-relaxed text-sm sm:text-base">
            {/* Introduction */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                1. Introduction & Overview
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Welcome to <strong>Tech Agenz</strong> (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
                &ldquo;us&rdquo;). We are an AI automation and custom software engineering agency
                based in Pakistan, serving domestic and international enterprise clients. We are
                committed to protecting your personal data, respecting your privacy rights, and
                maintaining strict transparency in our operational practices.
              </p>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                This Privacy Policy outlines how Tech Agenz collects, processes, stores, and
                protects information when you visit our website (
                <strong>https://techagenz.com</strong>), use our contact and consultation tools,
                interact with our web applications, or engage with our digital services.
              </p>
            </div>

            {/* Information We Collect */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                2. Information We Collect
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We collect information to provide better services to our clients, evaluate
                prospective development projects, and ensure our systems operate securely.
              </p>

              <div className="mt-4 space-y-4">
                <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-brand" /> A. Information You Voluntarily
                    Provide
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    When you submit an inquiry form, schedule a software discovery call, or email
                    us, you may provide:
                  </p>
                  <ul className="mt-2 list-disc list-inside text-xs sm:text-sm text-muted-foreground space-y-1">
                    <li>Full Name and Professional Title</li>
                    <li>Business Email Address and Direct Contact Phone Number</li>
                    <li>Company or Practice Name and Industry (e.g., Healthcare, Legal, Retail)</li>
                    <li>Project Scope, Technical Requirements, and Estimated Budget</li>
                    <li>
                      Any confidential documents or preliminary briefs uploaded for technical
                      evaluation
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <Eye className="h-4 w-4 text-brand" /> B. Information Automatically Collected
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    When you navigate our website, our hosting servers and analytics tools
                    automatically record standard diagnostic data:
                  </p>
                  <ul className="mt-2 list-disc list-inside text-xs sm:text-sm text-muted-foreground space-y-1">
                    <li>Browser type, version, and device operating system</li>
                    <li>
                      IP address (anonymized for analytics purposes) and approximate geographic
                      location
                    </li>
                    <li>Referring URL, pages visited, time spent per page, and navigation paths</li>
                    <li>HTTP request headers, timestamps, and network latency diagnostics</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Google AdSense & Cookies */}
            <div className="rounded-3xl border border-brand/30 bg-brand/5 p-6 sm:p-8">
              <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
                <Lock className="h-5 w-5 text-brand" /> 3. Google AdSense & Third-Party Advertising
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Tech Agenz participates in the <strong>Google AdSense</strong> publisher network to
                display relevant advertisements across our educational engineering blog. As part of
                this program:
              </p>
              <ul className="mt-3 space-y-2.5 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                  <span>
                    <strong>Third-Party Vendor Cookies:</strong> Google and third-party advertising
                    vendors use cookies to serve ads based on a user&rsquo;s prior visits to this
                    website or other websites across the internet.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                  <span>
                    <strong>DoubleClick / DART Cookies:</strong> Google&rsquo;s use of advertising
                    cookies enables it and its partners to serve ads to our users based on their
                    visit to our site and/or other sites on the Internet.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                  <span>
                    <strong>Opting Out of Personalized Advertising:</strong> Users may opt out of
                    personalized advertising by visiting the{" "}
                    <a
                      href="https://www.google.com/settings/ads"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand underline hover:text-brand/80"
                    >
                      Google Ads Settings
                    </a>
                    . Alternatively, you can opt out of a third-party vendor&rsquo;s use of cookies
                    for personalized advertising by visiting{" "}
                    <a
                      href="https://www.aboutads.info"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand underline hover:text-brand/80"
                    >
                      www.aboutads.info
                    </a>
                    .
                  </span>
                </li>
              </ul>
            </div>

            {/* Cookies & Tracking Technologies */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                4. Cookies & Local Storage
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                A cookie is a small text file placed on your device to remember user preferences and
                assist with system analytics. We categorize cookies into:
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/60 bg-card/30 p-4">
                  <h4 className="font-semibold text-foreground text-sm">Essential Cookies</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Required for core system navigation and dark/light UI theme persistence.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/30 p-4">
                  <h4 className="font-semibold text-foreground text-sm">Analytics Cookies</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Aggregated, non-personally identifiable metrics managed via Vercel Web Analytics
                    and Speed Insights.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/30 p-4">
                  <h4 className="font-semibold text-foreground text-sm">Advertising Cookies</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Deployed by Google AdSense to prevent repetitive ad displays and ensure
                    advertising relevance.
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-card/30 p-4">
                  <h4 className="font-semibold text-foreground text-sm">Session Storage</h4>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Used on our team portal and client lead forms to preserve draft inputs across
                    page refreshes.
                  </p>
                </div>
              </div>
            </div>

            {/* How We Use Your Information */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                5. How We Use Collected Information
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Tech Agenz does not sell, rent, or trade your personal data to third parties. We use
                your data strictly for:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground list-disc list-inside">
                <li>
                  Providing customized software development proposals, quotations, and technical
                  architecture scopes
                </li>
                <li>
                  Communicating with you regarding scheduled meetings, WhatsApp inquiries, or
                  ongoing development deliverables
                </li>
                <li>
                  Maintaining server security, preventing automated bot abuse, and diagnosing
                  application errors
                </li>
                <li>
                  Complying with applicable legal, tax, and regulatory obligations under the laws of
                  Pakistan
                </li>
              </ul>
            </div>

            {/* Data Retention & Security */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                6. Data Retention & Information Security
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                We implement industry-standard cryptographic and architectural measures to safeguard
                your information:
              </p>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    <strong>Encryption in Transit:</strong> 100% of network traffic is encrypted via
                    TLS 1.3 with modern cryptographic cipher suites.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    <strong>Isolated Infrastructure:</strong> Database records, appointment
                    schedules, and client briefs are stored in encrypted PostgreSQL clusters with
                    strict row-level security.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    <strong>Retention Period:</strong> Inactive inquiry data is purged after 24
                    months unless required for active contractual, accounting, or legal compliance.
                  </p>
                </div>
              </div>
            </div>

            {/* User Rights */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                7. Your Privacy Rights
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Regardless of your geographical location, we respect your fundamental privacy
                rights. You have the right to:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground list-disc list-inside text-xs sm:text-sm">
                <li>
                  <strong>Access:</strong> Request a copy of the personal data we hold about you.
                </li>
                <li>
                  <strong>Correction:</strong> Request rectification of any incomplete or inaccurate
                  data.
                </li>
                <li>
                  <strong>Deletion (Right to be Forgotten):</strong> Request the permanent erasure
                  of your personal data from our systems.
                </li>
                <li>
                  <strong>Objection / Restriction:</strong> Object to our processing of your
                  personal data for direct marketing.
                </li>
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                To exercise any of these rights, email our data protection desk at{" "}
                <a href="mailto:info@techagenz.com" className="text-brand underline">
                  info@techagenz.com
                </a>
                . Requests are processed within 14 business days.
              </p>
            </div>

            {/* Children's Privacy */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">
                8. Children&rsquo;s Privacy
              </h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Our services and website are intended for businesses, professionals, and adults aged
                18 and older. We do not knowingly collect personal identifiable information from
                children under the age of 13 (or under 16 in certain jurisdictions). If we discover
                that a minor has provided us with personal information, we will immediately delete
                such data.
              </p>
            </div>

            {/* Contact Information */}
            <div className="rounded-2xl border border-border/80 bg-card/60 p-6">
              <h2 className="font-display text-xl font-bold text-foreground">
                9. Contact Us Regarding Privacy
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                If you have questions, concerns, or requests regarding this Privacy Policy or our
                compliance with Google AdSense policies, please contact our legal and compliance
                desk:
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3 text-xs">
                <div className="flex items-center gap-2 text-foreground">
                  <Mail className="h-4 w-4 text-brand" />
                  <a href="mailto:info@techagenz.com" className="hover:underline">
                    info@techagenz.com
                  </a>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Phone className="h-4 w-4 text-brand" />
                  <a href="tel:+923394555004" className="hover:underline">
                    +92 339 4555004
                  </a>
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <MapPin className="h-4 w-4 text-brand" />
                  <span>Pakistan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default PrivacyPolicyPage;
