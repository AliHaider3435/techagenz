import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Shield, CheckCircle2, AlertCircle, Scale, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { TechCursor } from "@/components/TechCursor";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Tech Agenz | Custom Software Engineering" },
      {
        name: "description",
        content:
          "Read the official Terms of Service of Tech Agenz. Understand our custom software development terms, intellectual property agreements, SLA, deliverables, and service policies.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Terms of Service — Tech Agenz" },
      {
        property: "og:description",
        content: "Transparent terms and conditions governing engineering services with Tech Agenz.",
      },
      { property: "og:url", content: "https://techagenz.com/terms" },
    ],
    links: [{ rel: "canonical", href: "https://techagenz.com/terms" }],
  }),
  component: TermsOfServicePage,
});

function TermsOfServicePage() {
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
            <Scale className="h-3.5 w-3.5" /> Legal Agreement
          </div>
          <h1 className="font-hero mt-5 text-4xl font-bold uppercase sm:text-5xl">
            Terms of <span className="text-gradient-brand">Service</span>
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
            
            {/* 1. Acceptance */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">1. Acceptance of Terms</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;Client,&rdquo; &ldquo;User,&rdquo; or &ldquo;you&rdquo;) and <strong>Tech Agenz</strong> (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; or &ldquo;us&rdquo;), registered in Pakistan. By accessing our website, purchasing our services, or engaging us for software engineering, WhatsApp automation, or ERPNext deployment, you agree to be bound by these Terms and our{" "}
                <Link to="/privacy" className="text-brand underline hover:text-brand/80">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>

            {/* 2. Scope of Services */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">2. Scope of Engineering Services</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Tech Agenz provides bespoke software development, AI solutions, and systems integration services, including but not limited to:
              </p>
              <ul className="mt-3 grid gap-2.5 sm:grid-cols-2 text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                  <span>WhatsApp Business API automation & clinic scheduling</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                  <span>ERPNext v15 implementation & Frappe multi-warehouse setups</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                  <span>Real-time cloud POS & Kitchen Display Systems (KDS)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                  <span>Custom web applications using React 19, Node.js & PostgreSQL</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                  <span>Legal tech practice portals and confidential intake engines</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />
                  <span>AI chatbot development with Retrieval-Augmented Generation (RAG)</span>
                </li>
              </ul>
            </div>

            {/* 3. Statements of Work & Deliverables */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">3. Statements of Work (SOW) & Milestones</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Every custom project is executed under a detailed Statement of Work (SOW) or proposal defining project scope, deliverables, technology stack, acceptance criteria, milestone timelines, and commercial terms. Any alterations or scope expansions will be documented in a mutual Change Request order.
              </p>
            </div>

            {/* 4. Intellectual Property Rights */}
            <div className="rounded-2xl border border-border/80 bg-card/40 p-6">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5 text-brand" /> 4. Intellectual Property & Code Ownership
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <strong>Client Deliverables:</strong> Upon receipt of full payment for project milestones, Tech Agenz assigns to the Client all right, title, and interest in the custom application code, bespoke database schemas, and tailored assets created specifically for the project.
              </p>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                <strong>Pre-Existing IP & Open-Source:</strong> Tech Agenz retains ownership of proprietary libraries, pre-built utility scripts, and developer tooling. Open-source frameworks (e.g., React, Frappe, ERPNext, PostgreSQL, Node.js) remain governed by their respective open-source licenses (MIT, GNU GPL, Apache 2.0).
              </p>
            </div>

            {/* 5. Payment Terms & Invoicing */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">5. Commercial Terms & Invoicing</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Unless otherwise agreed in a specific contract:
              </p>
              <ul className="mt-3 space-y-2 text-muted-foreground list-disc list-inside text-xs sm:text-sm">
                <li>Fixed-price projects are billed on milestone basis (e.g., 30% advance, 40% demo milestone, 30% final go-live deployment).</li>
                <li>Invoices are due within 7 business days of issuance via direct bank wire transfer or authorized digital payment gateway.</li>
                <li>Monthly support, cloud infrastructure hosting, and maintenance retainers are invoiced on the first day of each billing cycle.</li>
              </ul>
            </div>

            {/* 6. Warranties & SLA */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">6. Production Warranty & Bug Support</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Tech Agenz provides a standard <strong>30-day post-launch warranty</strong> for all custom software deliverables. During this warranty window, we fix any verifiable defects, bugs, or discrepancies against agreed specifications at zero additional charge.
              </p>
            </div>

            {/* 7. Limitation of Liability */}
            <div className="rounded-2xl border border-border/80 bg-card/40 p-6">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-400" /> 7. Limitation of Liability
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                To the maximum extent permitted by applicable law, in no event shall Tech Agenz, its directors, employees, or contractors be liable for any indirect, incidental, punitive, or consequential damages, including loss of profits, data corruption, or business interruption arising out of your use or inability to use the software. Tech Agenz&rsquo;s total cumulative liability shall not exceed the aggregate fees paid by the client under the specific SOW during the preceding three (3) months.
              </p>
            </div>

            {/* 8. Governing Law & Jurisdiction */}
            <div>
              <h2 className="font-display text-2xl font-bold text-foreground">8. Governing Law & Dispute Resolution</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                These Terms and any dispute arising from them shall be governed by and construed in accordance with the laws of the <strong>Islamic Republic of Pakistan</strong>. The courts located in <strong>Lahore, Pakistan</strong> shall have exclusive jurisdiction to settle any disputes, provided both parties agree to first attempt resolution via amicable negotiation in good faith.
              </p>
            </div>

            {/* 9. Contact Details */}
            <div className="rounded-2xl border border-border/80 bg-card/60 p-6">
              <h2 className="font-display text-xl font-bold text-foreground">9. Inquiries Regarding Terms</h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                For questions regarding these Terms or to request a formal bilateral Master Services Agreement (MSA), reach out to our legal coordination team:
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
                  <span>Lahore, Punjab, Pakistan</span>
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

export default TermsOfServicePage;
