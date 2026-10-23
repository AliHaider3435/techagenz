import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Layers,
  Calendar,
  MessageSquare,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BouncyButton from "@/components/BouncyButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import { TechCursor } from "@/components/TechCursor";
import garwanLawChamber from "@/assets/garwan-law-chamber.webp";
import drIqbalKharal from "@/assets/dr-iqbal-kharal.webp";
import drSajidSohail from "@/assets/dr-sajid-sohail.webp";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Case Studies & Work — Tech Agenz | Custom Software in Pakistan" },
      {
        name: "description",
        content:
          "Production case studies of custom software development, healthcare clinic appointment systems, legal portals, and business automation platforms delivered by Tech Agenz in Pakistan.",
      },
      {
        name: "keywords",
        content:
          "Software House in Pakistan Case Studies, Doctor Appointment Booking System, Clinic Management Software Pakistan, Legal Tech Portal, Custom Software Development, WhatsApp Automation Case Study",
      },
      { property: "og:title", content: "Case Studies & Work — Tech Agenz | AI & Software House" },
      {
        property: "og:description",
        content:
          "Discover how Tech Agenz engineers high-impact custom software, clinic booking systems, and legal portals that streamline operations and eliminate bottlenecks.",
      },
      { property: "og:url", content: "https://techagenz.com/work" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://techagenz.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Case Studies & Work — Tech Agenz | Custom Software in Pakistan",
      },
      {
        name: "twitter:description",
        content:
          "Explore real-world case studies of clinic booking systems, legal tech portals, and business automation software engineered by Tech Agenz.",
      },
      { name: "twitter:image", content: "https://techagenz.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://techagenz.com/work" }],
  }),
  component: WorkPage,
});

interface CaseStudy {
  id: string;
  img: string;
  tag: string;
  title: string;
  client: string;
  industry: string;
  desc: string;
  problem: string;
  solution: string;
  results: string[];
  stack: string[];
}

const caseStudies: CaseStudy[] = [
  {
    id: "garwan-law-chamber",
    img: garwanLawChamber,
    tag: "Legal Tech",
    client: "Garwan Law Chamber",
    industry: "Corporate & Civil Law Practice",
    title: "Garwan Law Chamber: Modernizing Legal Intake & Attorney Portals",
    desc: "An authoritative digital legal practice portal featuring secure client consultation scheduling, structured case intake, and practice area directories.",
    problem:
      "Garwan Law Chamber handled high-stakes civil and corporate inquiries primarily through informal messaging and walk-ins. Prospective clients lacked a unified platform to review practice credentials, verify attorney jurisdictions, and submit confidential case briefs. Administrative staff spent hours daily sorting unvetted inquiries and coordinating lawyer schedules manually.",
    solution:
      "Tech Agenz designed and engineered a bespoke, secure legal technology portal tailored to the chamber's practice hierarchy. The platform incorporates structured case intake forms with preliminary fact gathering, automated appointment booking synced to advocate calendars, and authoritative practice directories that present credentials with institutional prestige. Deployed on modern server-rendered infrastructure with sub-second page loads and strict privacy protocols.",
    results: [
      "85% reduction in initial consultation administrative scheduling time",
      "Confidential upfront case intake capturing critical jurisdiction details",
      "Significant increase in corporate client conversion from international and local referrals",
      "Sub-second load times and 100% mobile responsive experience for prospective litigants",
    ],
    stack: ["React 19", "TypeScript", "Tailwind CSS", "Next.js", "PostgreSQL", "REST API"],
  },
  {
    id: "dr-iqbal-kharal",
    img: drIqbalKharal,
    tag: "Booking Systems",
    client: "Dr. Iqbal Ahmad Kharal",
    industry: "Specialist Clinical Practice",
    title: "Dr. Iqbal Ahmad Kharal: Real-Time Patient Scheduling & Queue Management",
    desc: "End-to-end clinical appointment scheduling and queue management system with automated SMS/WhatsApp alerts and real-time consultation tracking.",
    problem:
      "Handling up to 80 daily consultations through phone calls and physical reception desk registers created severe waiting room congestion. Patients frequently waited 2 to 3 hours past their estimated time. Double-bookings during surge hours frustrated patients, and clinic staff had no automated way to notify patients when appointments were delayed due to emergency procedures.",
    solution:
      "Tech Agenz engineered a high-concurrency patient appointment booking platform. We implemented atomic slot reservation to eliminate double bookings, a mobile-first appointment booking interface requiring zero app installation, and automated WhatsApp/SMS webhooks that confirm booking details. The doctor's administrative dashboard gives immediate control over session capacity, emergency slot freezes, and real-time patient queue monitoring.",
    results: [
      "42% decrease in physical waiting room overcrowding and patient wait times",
      "Near-zero missed appointments via automated WhatsApp/SMS reminders",
      "Atomic database locking eliminating double-booking incidents completely",
      "Staff phone inquiry workload reduced by over 70% during peak clinical hours",
    ],
    stack: ["React", "Node.js", "PostgreSQL", "Calendar Webhooks", "WhatsApp Cloud API", "Docker"],
  },
  {
    id: "dr-sajid-sohail",
    img: drSajidSohail,
    tag: "Healthcare",
    client: "Dr. Sajid Sohail (Rahmania Medical Center)",
    industry: "Hospital & Medical Center Healthcare",
    title: "Dr. Sajid Sohail: High-Volume Clinic Operations & Patient Consultation Portal",
    desc: "Responsive patient booking and clinical consultation workflow system engineered for Rahmania Medical Center with 15-minute slot allocation and automated confirmations.",
    problem:
      "Operating within Rahmania Medical Center, Dr. Sajid Sohail required a specialized digital workflow that coordinated seamlessly between hospital reception, patient inquiries, and daily consultation quotas. Relying on paper charts and phone calls led to scheduling gaps, manual errors in patient record intake, and high no-show rates during bad weather or hospital emergencies.",
    solution:
      "We built a tailored medical portal with 15-minute slot allocation, intelligent patient symptom intake questionnaires, and automated clinic confirmation notifications. The system features a doctor control panel to view expected patient volumes, mark completed consultations, and seamlessly reschedule appointments with one click. Hospital staff access a dedicated receptionist view to manage check-ins instantly.",
    results: [
      "35% increase in verified monthly patient consultations through automated scheduling",
      "No-show rate dropped to under 5% following automated pre-consultation reminders",
      "Pre-filled medical intake questionnaires saving 4 minutes per doctor consultation",
      "Integrated patient ledger and appointment history accessible in under 1 second",
    ],
    stack: ["React 19", "TypeScript", "Tailwind CSS", "Node.js", "Express", "PostgreSQL"],
  },
];

const categories = ["All", "Legal Tech", "Booking Systems", "Healthcare"];

function CaseStudyCard({ study, index }: { study: CaseStudy; index: number }) {
  return (
    <motion.article
      layout
      id={study.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="scroll-mt-28 glass-card overflow-hidden rounded-3xl border border-border/70 shadow-xl transition-colors hover:border-brand/40"
    >
      <div className="grid gap-8 lg:grid-cols-12 items-start p-6 sm:p-10">
        {/* Left Column: Visual & Client Meta (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-border/60 bg-slate-950">
            <img
              src={study.img}
              alt={`${study.title} by Tech Agenz`}
              width={800}
              height={500}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
            <div className="absolute top-3 left-3">
              <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-500/20 backdrop-blur-md">
                {study.tag}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card/60 p-5 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Client:</span>
              <strong className="text-foreground">{study.client}</strong>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-border/40 pt-2">
              <span className="text-muted-foreground">Industry:</span>
              <span className="text-foreground/90">{study.industry}</span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-border/40 pt-2">
              <span className="text-muted-foreground">Engineering Partner:</span>
              <span className="text-brand font-medium">Tech Agenz</span>
            </div>
          </div>

          {/* Tech Stack Badges */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-brand" /> Architecture & Tech Stack:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {study.stack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-brand/10 border border-brand/20 px-3 py-1 text-xs font-medium text-brand"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/contact"
              className="glow-brand inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-6 py-3 text-xs sm:text-sm font-semibold text-primary-foreground hover:scale-[1.02] transition-transform"
            >
              Inquire About Similar Architecture <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: Case Study Deep Dive (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              {study.title}
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
              {study.desc}
            </p>
          </div>

          {/* The Problem */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400">
              <AlertCircle className="h-4 w-4" /> Operational Challenge & Problem
            </div>
            <p className="mt-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed">
              {study.problem}
            </p>
          </div>

          {/* The Solution */}
          <div className="rounded-2xl border border-brand/30 bg-brand/5 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
              <Sparkles className="h-4 w-4" /> The Engineered Solution
            </div>
            <p className="mt-2.5 text-xs sm:text-sm text-foreground/90 leading-relaxed">
              {study.solution}
            </p>
          </div>

          {/* Measurable Results */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <TrendingUp className="h-4 w-4" /> Quantifiable Results & Impact
            </div>
            <ul className="mt-3 space-y-2 text-xs sm:text-sm text-foreground/90">
              {study.results.map((res, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                  <span>{res}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function WorkPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredStudies =
    activeCategory === "All" ? caseStudies : caseStudies.filter((s) => s.tag === activeCategory);

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
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs uppercase tracking-widest text-brand"
          >
            <Sparkles className="h-3.5 w-3.5" /> Proven Case Studies
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-hero mt-5 text-4xl font-bold uppercase sm:text-6xl"
          >
            Engineering That Solves <br />
            <span className="text-gradient-brand">Real Operational Bottlenecks</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg leading-relaxed"
          >
            Detailed production case studies from Tech Agenz. Explore how we architected custom
            software, patient scheduling workflows, and legal portals for clinics, law firms, and
            growing businesses across Pakistan.
          </motion.p>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <section className="relative pb-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-5 py-2 text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand text-primary-foreground glow-brand font-semibold"
                      : "border border-border/80 bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Case Studies Deep Dive List */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-6 space-y-12">
          <AnimatePresence mode="popLayout">
            {filteredStudies.map((study, idx) => (
              <CaseStudyCard key={study.id} study={study} index={idx} />
            ))}
          </AnimatePresence>
        </div>
      </section>

      {/* Case Studies Summary & Verification Statement */}
      <section className="relative pb-20 border-t border-border/60 pt-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center border border-brand/20">
            <h2 className="font-display text-2xl font-bold sm:text-3xl text-foreground">
              Verifiable Quality, Real Production Deployments
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Every system highlighted above is live in production with active users. From complex
              database atomicity ensuring zero patient appointment collisions to encrypted legal
              consultation intake, Tech Agenz engineers platforms you can trust.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <BouncyButton
                href="/contact"
                className="glow-brand inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-primary-foreground"
              >
                Start a project <ArrowUpRight className="h-4 w-4" />
              </BouncyButton>
              <a
                href="https://wa.me/923394555004"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <MessageSquare className="h-4 w-4" /> WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default WorkPage;
