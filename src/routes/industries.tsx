import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Scale,
  GraduationCap,
  ShoppingBag,
  Briefcase,
  Rocket,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Globe,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { TechCursor } from "@/components/TechCursor";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import BouncyButton from "@/components/BouncyButton";

const industriesSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Industries We Serve — Tech Agenz",
  url: "https://techagenz.com/industries",
  description:
    "Custom software development, AI automation, and WhatsApp AI agents tailored for Healthcare, Legal, Education, E-commerce, Professional Services, and Startups & SMEs.",
  provider: {
    "@type": "ProfessionalService",
    name: "Tech Agenz",
    url: "https://techagenz.com",
  },
};

interface IndustryItem {
  id: string;
  icon: typeof Stethoscope;
  tag: string;
  title: string;
  challenge: string;
  solution: string;
  capabilities: string[];
  stack: string[];
  caseStudyLink?: {
    label: string;
    slug: string;
  };
}

const industries: IndustryItem[] = [
  {
    id: "healthcare",
    icon: Stethoscope,
    tag: "Healthcare & Clinics",
    title: "Patient Scheduling, Clinic Portals & WhatsApp Care",
    challenge:
      "Clinics and healthcare providers lose hours daily to manual phone bookings, missed appointment follow-ups, and fragmented patient intake records.",
    solution:
      "We engineer real-time doctor appointment booking platforms, automated WhatsApp confirmation & reminder workflows, and clinical queue management systems.",
    capabilities: [
      "Real-time slot booking with automated conflict prevention",
      "WhatsApp AI agents for appointment reminders and FAQs",
      "Digital patient intake and consultation history tracking",
      "Multi-clinic and multi-physician schedule coordination",
    ],
    stack: ["React 19", "TypeScript", "WhatsApp Cloud API", "PostgreSQL", "n8n"],
    caseStudyLink: {
      label: "View Dr. Iqbal Kharal Case Study",
      slug: "dr-iqbal-kharal",
    },
  },
  {
    id: "legal",
    icon: Scale,
    tag: "Legal & Law Chambers",
    title: "Structured Case Intake & Advocate Consultation Portals",
    challenge:
      "Law firms receive unstructured inquiries via phone and messaging, wasting senior attorney hours on unvetted consultations and manual calendar coordination.",
    solution:
      "We build authoritative legal practice portals with structured digital case intake, confidential brief submissions, and advocate-synced consultation scheduling.",
    capabilities: [
      "Structured intake forms capturing jurisdiction and case facts upfront",
      "Automated consultation booking synced to advocate availability",
      "Authoritative practice-area directories and credential showcases",
      "Confidential document handling with role-based access control",
    ],
    stack: ["React 19", "TypeScript", "Tailwind CSS", "PostgreSQL", "Cloudflare"],
    caseStudyLink: {
      label: "View Garwan Law Chamber Case Study",
      slug: "garwan-law-chamber",
    },
  },
  {
    id: "education",
    icon: GraduationCap,
    tag: "Education & Training",
    title: "Admissions Automation, Student Portals & Academic ERP",
    challenge:
      "Educational institutions struggle with disconnected admissions spreadsheets, manual fee tracking, and slow responses to prospective student inquiries.",
    solution:
      "We deploy integrated student portals, AI-assisted admissions support on web and WhatsApp, and customized ERPNext academic & finance modules.",
    capabilities: [
      "24/7 AI admissions assistant for program and fee inquiries",
      "Automated application intake, document checks, and status updates",
      "Unified fee management, attendance, and academic reporting",
      "Custom learning portals and faculty administration dashboards",
    ],
    stack: ["ERPNext", "Python", "TypeScript", "WhatsApp Cloud API", "n8n"],
  },
  {
    id: "ecommerce",
    icon: ShoppingBag,
    tag: "E-commerce & Retail",
    title: "High-Conversion Storefronts, Order Automation & Inventory Sync",
    challenge:
      "Growing retail brands face inventory mismatches across warehouses, high cart abandonment, and overwhelmed support teams answering order-status tickets.",
    solution:
      "We build fast custom web storefronts connected to ERPNext inventory, automated n8n order pipelines, and proactive WhatsApp order & delivery notifications.",
    capabilities: [
      "Sub-second custom storefronts engineered for mobile conversion",
      "Automated WhatsApp order confirmations, tracking, and COD verification",
      "Real-time multi-warehouse stock and accounting synchronization",
      "API integrations with payment gateways, couriers, and marketplaces",
    ],
    stack: ["React", "Node.js", "ERPNext", "n8n", "WhatsApp Cloud API"],
  },
  {
    id: "professional-services",
    icon: Briefcase,
    tag: "Professional Services",
    title: "CRM Pipelines, Client Portals & Workflow Automation",
    challenge:
      "Consulting firms, agencies, and financial practices rely on manual copy-pasting between email, spreadsheets, invoicing tools, and project trackers.",
    solution:
      "We connect your entire operational stack using custom API integrations, n8n workflow automation, and tailored client portals that eliminate repetitive admin work.",
    capabilities: [
      "Automated lead capture, qualification, and CRM pipeline routing",
      "Client onboarding portals with automated contract and invoice triggers",
      "AI knowledge-base assistants for internal teams and client support",
      "Executive dashboards unifying finance, utilization, and delivery",
    ],
    stack: ["n8n", "TypeScript", "Node.js", "FastAPI", "PostgreSQL"],
  },
  {
    id: "startups-smes",
    icon: Rocket,
    tag: "Startups & SMEs",
    title: "MVP Engineering, SaaS Architecture & AI Integration",
    challenge:
      "Startups and SMEs need to launch production-grade products quickly without accumulating brittle technical debt or locking into expensive per-seat SaaS tools.",
    solution:
      "We partner as your dedicated engineering team to architect scalable SaaS platforms, multi-tenant web applications, and practical AI features from day one.",
    capabilities: [
      "Rapid MVP design and full-stack engineering with clean code ownership",
      "Multi-tenant SaaS architecture with authentication, billing, and RBAC",
      "Embedded AI agents, RAG pipelines, and LLM workflow orchestration",
      "Cloud-native deployment on AWS and Cloudflare with CI/CD pipelines",
    ],
    stack: ["TanStack Start", "React 19", "Node.js", "Python", "Cloudflare / AWS"],
  },
];

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries We Serve — Tech Agenz | Custom Software & AI Automation" },
      {
        name: "description",
        content:
          "Discover how Tech Agenz builds custom software, AI automation, and WhatsApp AI agents for Healthcare, Legal, Education, E-commerce, Professional Services, and Startups.",
      },
      {
        name: "keywords",
        content:
          "Healthcare Software Development, Legal Tech Portals, E-commerce Automation, SaaS Development Company, Business Process Automation, AI Solutions for Business",
      },
      { property: "og:title", content: "Industries We Serve — Tech Agenz" },
      {
        property: "og:description",
        content:
          "Tailored custom software, AI workflows, and WhatsApp automation for Healthcare, Legal, Education, E-commerce, Professional Services, and Startups.",
      },
      { property: "og:url", content: "https://techagenz.com/industries" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://techagenz.com/og-image.jpg" },
      {
        property: "og:image:alt",
        content: "Tech Agenz — Industry-Specific Software & AI Automation Solutions",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Industries We Serve — Tech Agenz" },
      {
        name: "twitter:description",
        content:
          "Custom software, AI automation, and WhatsApp AI agents engineered for regulated and high-growth industries worldwide.",
      },
      { name: "twitter:image", content: "https://techagenz.com/og-image.jpg" },
      {
        name: "twitter:image:alt",
        content: "Tech Agenz — Industry-Specific Software & AI Automation Solutions",
      },
    ],
    links: [{ rel: "canonical", href: "https://techagenz.com/industries" }],
  }),
  component: IndustriesPage,
});

function IndustriesPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <TechCursor />
      <WhatsAppButton />
      <Nav />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(industriesSchema) }}
      />

      <main id="main-content" tabIndex={-1}>
        {/* Hero Header */}
        <section className="relative pt-36 pb-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(0.7 0.19 240 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.19 240 / 0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
            }}
          />
          <div className="relative mx-auto max-w-5xl px-6 text-center">
            <div className="mb-6 flex justify-center">
              <Breadcrumbs items={[{ label: "Industries" }]} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs uppercase tracking-widest text-brand"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Domain-Focused Engineering
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-hero mt-5 text-4xl font-bold uppercase sm:text-6xl"
            >
              Software Built for <br />
              <span className="text-gradient-brand">Your Industry</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-display mx-auto mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Every sector has distinct compliance, workflow, and customer experience demands. We
              design custom software, AI automation, and integrated platforms tailored to how your
              industry actually operates.
            </motion.p>

            {/* Quick jump pills */}
            <div className="mt-8 flex flex-wrap justify-center gap-2">
              {industries.map((ind) => (
                <a
                  key={ind.id}
                  href={`#${ind.id}`}
                  className="rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-brand/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  {ind.tag}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Industries Grid */}
        <section className="relative py-10">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-8 lg:grid-cols-2">
              {industries.map((ind, idx) => {
                const Icon = ind.icon;
                return (
                  <motion.article
                    key={ind.id}
                    id={ind.id}
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{ duration: 0.5, delay: (idx % 2) * 0.08 }}
                    className="glass-card scroll-mt-28 flex flex-col justify-between rounded-3xl p-8 sm:p-10 transition-colors hover:border-brand/40"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3.5 py-1 text-xs font-medium text-brand ring-1 ring-brand/30">
                          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{ind.tag}</span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground/60">
                          0{idx + 1}
                        </span>
                      </div>

                      <h2 className="mt-5 font-display text-2xl font-bold text-foreground sm:text-3xl">
                        {ind.title}
                      </h2>

                      <div className="mt-5 space-y-3 text-sm leading-relaxed">
                        <div className="rounded-2xl border border-border/50 bg-background/50 p-4">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            The Challenge
                          </div>
                          <p className="mt-1 text-muted-foreground">{ind.challenge}</p>
                        </div>

                        <div className="rounded-2xl border border-brand/20 bg-brand/5 p-4">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-brand">
                            Our Solution
                          </div>
                          <p className="mt-1 text-foreground/90">{ind.solution}</p>
                        </div>
                      </div>

                      <ul className="mt-6 space-y-2.5" role="list">
                        {ind.capabilities.map((cap) => (
                          <li key={cap} className="flex items-start gap-2.5 text-sm">
                            <CheckCircle2
                              className="mt-0.5 h-4 w-4 shrink-0 text-brand"
                              aria-hidden="true"
                            />
                            <span className="text-foreground/90">{cap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-8 border-t border-border/50 pt-6">
                      <div className="flex flex-wrap gap-2">
                        {ind.stack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs text-muted-foreground"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="mt-6 flex flex-wrap items-center gap-3">
                        <Link
                          to="/contact"
                          className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-semibold text-primary-foreground transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          Discuss Your Project{" "}
                          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                        {ind.caseStudyLink && (
                          <Link
                            to="/work/$slug"
                            params={{ slug: ind.caseStudyLink.slug }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/60 px-4 py-2.5 text-xs font-medium text-foreground transition-colors hover:border-brand/50 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                          >
                            {ind.caseStudyLink.label}{" "}
                            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>

        {/* International Delivery Banner */}
        <section className="relative py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="glass-card relative overflow-hidden rounded-3xl p-8 sm:p-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 right-0 h-72 w-72 rounded-full bg-brand/20 blur-3xl"
              />
              <div className="relative grid items-center gap-8 lg:grid-cols-[1.3fr_0.7fr]">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand">
                    <Globe className="h-4 w-4" aria-hidden="true" /> Global Delivery Standards
                  </div>
                  <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                    Partnering with Teams Across{" "}
                    <span className="text-gradient-brand">
                      US, UK, Europe, Middle East &amp; APAC
                    </span>
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    Whether you are a startup launching your first SaaS product in London or New
                    York, a healthcare clinic automating patient bookings, or an enterprise
                    modernizing operations in Dubai or Riyadh, our engineering workflows adapt to
                    your time zone and compliance requirements.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
                  <BouncyButton
                    href="/contact"
                    className="glow-brand inline-flex items-center justify-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground"
                  >
                    <Zap className="h-4 w-4" aria-hidden="true" />
                    Book a Discovery Call
                  </BouncyButton>
                  <Link
                    to="/services"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card/70 px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-card"
                  >
                    Explore All Services <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
