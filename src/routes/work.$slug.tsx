import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  AlertCircle,
  Sparkles,
  Layers,
  GitBranch,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Clock,
  ShieldCheck,
  MessageSquare,
  ChevronRight,
  Star,
  Quote,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { TechCursor } from "@/components/TechCursor";
import BouncyButton from "@/components/BouncyButton";
import ProjectCard from "@/components/ProjectCard";
import { getProjectBySlug, getRelatedProjects } from "@/lib/projects-data";

export const Route = createFileRoute("/work/$slug")({
  loader: async ({ params }) => {
    const project = getProjectBySlug(params.slug);
    if (!project) {
      throw notFound();
    }
    const related = getRelatedProjects(params.slug, 2);
    return { project, related };
  },
  head: ({ loaderData }) => {
    const project = loaderData?.project;
    if (!project) {
      return {
        meta: [{ title: "Case Study Not Found — Tech Agenz" }],
      };
    }

    return {
      meta: [
        { title: `${project.title} — Case Study | Tech Agenz` },
        { name: "description", content: project.formulaSummary },
        { property: "og:title", content: `${project.title} — Tech Agenz` },
        { property: "og:description", content: project.formulaSummary },
        { property: "og:image", content: project.coverImage },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `https://techagenz.com/work/${project.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: `${project.title} — Tech Agenz` },
        { name: "twitter:description", content: project.formulaSummary },
      ],
      links: [{ rel: "canonical", href: `https://techagenz.com/work/${project.slug}` }],
    };
  },
  component: CaseStudyDetailPage,
});

function CaseStudyDetailPage() {
  const { project, related } = Route.useLoaderData();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <TechCursor />
      <WhatsAppButton />
      <Nav />

      {/* Hero Header & Breadcrumb */}
      <section className="relative pt-32 pb-12 sm:pt-36 sm:pb-16">
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

        <div className="relative mx-auto max-w-5xl px-6">
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/work" className="hover:text-foreground transition-colors">
              Work & Portfolio
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground truncate max-w-[240px] sm:max-w-none">
              {project.shortTitle}
            </span>
          </nav>

          {/* Category & Status Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1 text-xs font-semibold text-brand">
              <Sparkles className="h-3.5 w-3.5" /> {project.category}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {project.status}
            </span>
            <span className="text-xs text-muted-foreground border-l border-border/60 pl-2.5">
              Timeline: <strong className="text-foreground">{project.timeline}</strong>
            </span>
          </div>

          {/* Title in required format: Project Name: What It Is, Said Plainly */}
          <h1 className="font-hero mt-5 text-3xl font-bold sm:text-5xl leading-tight text-foreground">
            {project.title}
          </h1>

          {/* Formula summary paragraph */}
          <p className="mt-5 text-base sm:text-lg leading-relaxed text-muted-foreground border-l-2 border-brand/50 pl-4 bg-card/30 py-2 rounded-r-xl">
            {project.formulaSummary}
          </p>

          {/* Client & Deployment Meta Cards */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 rounded-2xl border border-border/70 bg-card/60 p-4 sm:p-5 backdrop-blur-md">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Client Profile
              </div>
              <div className="mt-1 text-xs sm:text-sm font-semibold text-foreground">
                {project.clientType}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Primary Goal
              </div>
              <div className="mt-1 text-xs sm:text-sm font-semibold text-foreground">
                {project.results.stats[0]?.label}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Time to Go-Live
              </div>
              <div className="mt-1 text-xs sm:text-sm font-semibold text-emerald-400 font-mono">
                {project.timeline}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Engineering
              </div>
              <div className="mt-1 text-xs sm:text-sm font-semibold text-brand">
                Tech Agenz
              </div>
            </div>
          </div>

          {/* 16:9 Cover Image */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-border/80 bg-slate-950 shadow-2xl">
            <div className="relative aspect-video w-full">
              <img
                src={project.coverImage}
                alt={project.title}
                width={1280}
                height={720}
                loading="eager"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-6 right-6 hidden sm:flex items-center justify-between text-xs text-white/90">
                <span className="rounded-full bg-slate-950/80 px-3 py-1 font-mono backdrop-blur-md border border-white/10">
                  {project.shortTitle}
                </span>
                <span className="rounded-full bg-emerald-500/80 px-3 py-1 font-semibold text-slate-950 backdrop-blur-md">
                  Active Production System
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Study Long-Form Content in EXACT Required Order:
          1. Problem (the client's pain in 2 to 3 lines)
          2. Solution (what you built)
          3. Tech stack
          4. Process or architecture (a diagram works well)
          5. Results (numbers)
          6. Screenshots / Key capabilities
          7. A “Start a project like this” button
      */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-4xl px-6 space-y-16">
          {/* 1. Problem (the client's pain in 2 to 3 lines) */}
          <div className="rounded-3xl border border-red-500/20 bg-gradient-to-b from-red-500/10 via-card/50 to-card/30 p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400">
              <AlertCircle className="h-4 w-4" /> 1. The Operational Problem
            </div>
            <h2 className="mt-3 font-display text-xl sm:text-2xl font-bold text-foreground">
              {project.problem.heading}
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-foreground/90 font-medium">
              {project.problem.description}
            </p>

            <div className="mt-6 border-t border-red-500/20 pt-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-red-300/80 mb-3">
                Key Friction Points Identified:
              </div>
              <ul className="grid gap-2.5 sm:grid-cols-2 text-xs sm:text-sm text-foreground/80">
                {project.problem.painPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold shrink-0">✕</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2. Solution (what you built) */}
          <div className="rounded-3xl border border-brand/30 bg-gradient-to-b from-brand/10 via-card/50 to-card/30 p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand">
              <Sparkles className="h-4 w-4" /> 2. The Engineered Solution
            </div>
            <h2 className="mt-3 font-display text-xl sm:text-2xl font-bold text-foreground">
              {project.solution.heading}
            </h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-foreground/90">
              {project.solution.description}
            </p>

            <div className="mt-6 border-t border-brand/20 pt-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-brand mb-3">
                Core Deliverables Built by Tech Agenz:
              </div>
              <ul className="grid gap-2.5 sm:grid-cols-2 text-xs sm:text-sm text-foreground/90">
                {project.solution.keyDeliverables.map((del, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                    <span>{del}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 3. Tech Stack */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400">
              <Layers className="h-4 w-4" /> 3. Technology Stack & Frameworks
            </div>
            <h2 className="mt-3 font-display text-xl sm:text-2xl font-bold text-foreground">
              Chosen for Stability, Latency & Long-Term Maintainability
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Zero bloatware. Every tool in this stack was selected for guaranteed uptime, instant concurrency, and low maintenance overhead.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {project.stack.map((tech) => (
                <div
                  key={tech}
                  className="inline-flex items-center gap-2 rounded-xl border border-brand/30 bg-brand/5 px-4 py-2.5 text-xs sm:text-sm font-medium text-foreground hover:border-brand transition-colors"
                >
                  <span className="h-2 w-2 rounded-full bg-brand" />
                  <span>{tech}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Process or Architecture (Diagram & Flow) */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400">
              <GitBranch className="h-4 w-4" /> 4. Process & Architecture Workflow
            </div>
            <h2 className="mt-3 font-display text-xl sm:text-2xl font-bold text-foreground">
              End-to-End System Flow
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              {project.architecture.overview}
            </p>

            {/* Architecture Steps Flow Diagram */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {project.architecture.flowSteps.map((step, idx) => (
                <div
                  key={step.step}
                  className="relative rounded-2xl border border-border/70 bg-background/50 p-4 transition-all hover:border-brand/40"
                >
                  <div className="font-mono text-2xl font-black text-brand/40">
                    {step.step}
                  </div>
                  <h3 className="mt-2 text-xs sm:text-sm font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                  {idx < project.architecture.flowSteps.length - 1 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-brand font-bold">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. Results (Numbers & Countable Facts) */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-500/10 via-card/50 to-card/30 p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400">
              <TrendingUp className="h-4 w-4" /> 5. Quantifiable Production Results
            </div>
            <h2 className="mt-3 font-display text-xl sm:text-2xl font-bold text-foreground">
              Real Metrics from Live Operations
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
              Countable operational facts and verified performance indicators post go-live:
            </p>

            {/* Metric Highlights Grid */}
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {project.results.stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-emerald-500/20 bg-background/60 p-4 text-center sm:text-left"
                >
                  <div className="font-mono text-2xl sm:text-3xl font-extrabold text-emerald-400">
                    {stat.metric}
                  </div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wider text-foreground">
                    {stat.label}
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground leading-tight">
                    {stat.context}
                  </div>
                </div>
              ))}
            </div>

            {/* Bullet Results */}
            <div className="mt-8 border-t border-emerald-500/20 pt-5">
              <ul className="space-y-2.5 text-xs sm:text-sm text-foreground/90">
                {project.results.bullets.map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 6. Key Capabilities & System Highlights */}
          <div className="rounded-3xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand">
              <ShieldCheck className="h-4 w-4" /> 6. Key System Capabilities
            </div>
            <h2 className="mt-3 font-display text-xl sm:text-2xl font-bold text-foreground">
              Engineered Features Built Into Production
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {project.keyFeatures.map((feat) => (
                <div
                  key={feat.title}
                  className="rounded-2xl border border-border/60 bg-background/40 p-5 space-y-2"
                >
                  {feat.tag && (
                    <span className="inline-block rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-brand">
                      {feat.tag}
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-foreground">{feat.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Client Testimonial if available */}
            {project.testimonial && (
              <div className="mt-8 rounded-2xl border border-brand/20 bg-brand/5 p-6 relative">
                <Quote className="absolute right-4 top-4 h-8 w-8 text-brand/20 pointer-events-none" />
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-[11px] font-semibold text-foreground/80 ml-1">
                    Client Verdict
                  </span>
                </div>
                <p className="text-sm italic text-foreground/90">
                  &ldquo;{project.testimonial.quote}&rdquo;
                </p>
                <div className="mt-3 text-xs">
                  <strong className="text-foreground">{project.testimonial.author}</strong> —{" "}
                  <span className="text-muted-foreground">{project.testimonial.role}, {project.testimonial.organization}</span>
                </div>
              </div>
            )}
          </div>

          {/* 7. A “Start a project like this” button */}
          <div className="rounded-3xl border border-brand/30 bg-gradient-to-r from-brand/10 via-card/80 to-brand/10 p-8 sm:p-12 text-center backdrop-blur-md">
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
              Want Similar Results for Your Business?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-muted-foreground leading-relaxed">
              We engineer custom software, WhatsApp bots, and ERPNext systems designed around your real operational bottlenecks. Typical turnaround is 3 to 5 weeks.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <BouncyButton
                href={`/contact?project=${project.slug}`}
                className="glow-brand inline-flex items-center gap-2 rounded-full bg-brand px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:scale-105 transition-transform"
              >
                Start a Project Like This <ArrowUpRight className="h-4 w-4" />
              </BouncyButton>
              <a
                href={`https://wa.me/923394555004?text=Hello%20Tech%20Agenz,%20I%20reviewed%20your%20${encodeURIComponent(project.shortTitle)}%20case%20study%20and%20would%20like%20to%20discuss%20a%20similar%20system.`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-6 py-3.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <MessageSquare className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>

          {/* Related Case Studies */}
          {related.length > 0 && (
            <div className="pt-8 border-t border-border/60">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Related Case Studies
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Explore more production architectures engineered by Tech Agenz.
                  </p>
                </div>
                <Link
                  to="/work"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
                >
                  View All <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                {related.map((rel) => (
                  <ProjectCard key={rel.slug} project={rel} />
                ))}
              </div>
            </div>
          )}

          {/* Back link */}
          <div className="text-center pt-6">
            <Link
              to="/work"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to all projects & case studies
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default CaseStudyDetailPage;
