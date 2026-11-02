import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, ArrowUpRight, ShieldCheck } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { TechCursor } from "@/components/TechCursor";
import BouncyButton from "@/components/BouncyButton";
import { getAllProjects, projectCategories } from "@/lib/projects-data";
import clientPortrait from "@/assets/team6.jpg";

export const Route = createFileRoute("/work/")({
  head: () => ({
    meta: [
      { title: "Portfolio & Case Studies — Tech Agenz | Production Software & Automations" },
      {
        name: "description",
        content:
          "Explore production case studies of clinical appointment scheduling systems, legal tech portals, and patient consultation workflows engineered by Tech Agenz in Pakistan.",
      },
      {
        name: "keywords",
        content:
          "Software House in Pakistan Portfolio, Clinic Management Software, Doctor Appointment Booking System, Legal Tech Portal, Custom Software Development Case Studies",
      },
      { property: "og:title", content: "Portfolio & Case Studies — Tech Agenz" },
      {
        property: "og:description",
        content:
          "Verifiable production case studies with real metrics: clinical queue management, legal practice intake, and patient consultation portals.",
      },
      { property: "og:url", content: "https://techagenz.com/work" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://techagenz.com/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://techagenz.com/work" }],
  }),
  component: WorkPortfolioPage,
});

function PortfolioRow({
  project,
  index,
}: {
  project: ReturnType<typeof getAllProjects>[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
    >
      <Link
        to="/work/$slug"
        params={{ slug: project.slug }}
        data-cursor="hover"
        className="group flex items-center gap-3.5 py-3 transition-colors hover:bg-white/[0.03] rounded-lg px-2 -mx-2"
      >
        {/* Small thumbnail */}
        <div className="shrink-0 w-12 h-10 rounded-md overflow-hidden bg-slate-900 border border-white/10 group-hover:border-cyan-400/50 transition-colors">
          <img
            src={project.coverImage}
            alt={project.shortTitle}
            width={48}
            height={40}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h4 className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
            {project.shortTitle}
          </h4>
          <p className="text-[11px] text-slate-400 line-clamp-1 leading-snug mt-0.5">
            {project.formulaSummary}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

function WorkPortfolioPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const allProjects = getAllProjects();

  const filteredProjects =
    activeCategory === "All"
      ? allProjects
      : allProjects.filter((p) => p.category === activeCategory);

  // Split projects into two columns
  const mid = Math.ceil(filteredProjects.length / 2);
  const leftCol = filteredProjects.slice(0, mid);
  const rightCol = filteredProjects.slice(mid);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <TechCursor />
      <WhatsAppButton />
      <Nav />

      {/* Hero Header */}
      <section className="relative pt-36 pb-10">
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
            <Sparkles className="h-3.5 w-3.5" /> Production Portfolio &amp; Case Studies
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
            Every project below represents a live system in active use — built with transparent
            architectures, countable metrics, and rapid 3-to-5-week delivery timelines.
          </motion.p>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap justify-center gap-2">
            {projectCategories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-5 py-2 text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-brand text-primary-foreground glow-brand font-semibold shadow-md shadow-brand/20"
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

      {/* 3-Column Portfolio Card Layout Matching Reference Screenshot */}
      <section className="relative pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="rounded-2xl border border-white/10 bg-slate-950/70 backdrop-blur-xl p-5 sm:p-8 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

              {/* Left Column: PORTFOLIO */}
              <div className="lg:col-span-4 flex flex-col">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-white/5">
                  Portfolio
                </h3>
                <div className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {leftCol.map((project, idx) => (
                      <PortfolioRow key={project.slug} project={project} index={idx} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Middle Column: PORTFOLIO */}
              <div className="lg:col-span-4 flex flex-col">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-white/5">
                  Portfolio
                </h3>
                <div className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {rightCol.map((project, idx) => (
                      <PortfolioRow key={project.slug} project={project} index={idx + leftCol.length} />
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Column: TESTIMONIAL */}
              <div className="lg:col-span-4 flex flex-col">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-white/5">
                  Testimonial
                </h3>
                <div className="relative rounded-xl overflow-hidden border border-white/10 bg-slate-900 flex-1 min-h-[380px] flex flex-col justify-end p-6 group">
                  <img
                    src={clientPortrait}
                    alt="Client Testimonial"
                    className="absolute inset-0 w-full h-full object-cover grayscale contrast-125 brightness-75 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/20" />

                  <div className="relative z-10 space-y-4">
                    <p className="text-sm sm:text-base font-medium leading-relaxed text-slate-100">
                      &ldquo;Out of everyone who I got quotes from, they were the first ones to go, &lsquo;Hey, let&apos;s develop a proof of concept for you.&rsquo; ... They are very, very professional. I&apos;ll go for them again.&rdquo;
                    </p>

                    <Link
                      to="/contact"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-950 hover:bg-cyan-400 transition-colors shadow-lg"
                    >
                      <span>Watch Testimonial</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Note */}
            <div className="mt-6 pt-4 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
              <span>No email required to see your number.</span>
              <span className="text-slate-400">
                Production-grade delivery in 3 to 5 weeks. No upfront lock-in.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative pb-24 border-t border-border/60 pt-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center border border-brand/20">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400 mb-4">
              <ShieldCheck className="h-4 w-4" /> 100% Production-Grade Standards
            </div>
            <h2 className="font-display text-2xl font-bold sm:text-4xl text-foreground">
              Ready to Solve Your Operational Bottleneck?
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
              Whether you need clinical appointment scheduling, automated WhatsApp queue alerts, or a
              bespoke legal technology portal, we engineer production software designed around your
              real operational workflows.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <BouncyButton
                href="/contact"
                className="glow-brand inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:scale-105 transition-transform"
              >
                Start a Project Like This <ArrowUpRight className="h-4 w-4" />
              </BouncyButton>
              <a
                href="https://wa.me/923394555004"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-6 py-3.5 text-sm font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                <MessageSquare className="h-4 w-4" /> Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default WorkPortfolioPage;
