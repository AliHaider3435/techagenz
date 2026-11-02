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
}));

function PortfolioRow({
  project,
  index,
}: {
  project: ReturnType<typeof getAllProjects>[number];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.25, delay: index * 0.04 }}
    >
      <Link
        to="/work/$slug"
        params={{ slug: project.slug }}
        data-cursor="hover"
        className="group flex items-start gap-4 py-4 border-b border-border/40 hover:border-brand/30 transition-colors"
      >
        {/* Small thumbnail */}
        <div className="shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-slate-900 border border-border/50 group-hover:border-brand/30 transition-colors">
          <img
            src={project.coverImage}
            alt={project.shortTitle}
            width={56}
            height={56}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-brand transition-colors leading-snug line-clamp-1">
            {project.shortTitle}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {project.formulaSummary}
          </p>
        </div>

        {/* Arrow */}
        <ArrowUpRight className="shrink-0 h-4 w-4 text-muted-foreground/40 group-hover:text-brand group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all mt-0.5" />
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

  // Split into two columns
  const mid = Math.ceil(filteredProjects.length / 2);
  const leftCol = filteredProjects.slice(0, mid);
  const rightCol = filteredProjects.slice(mid);

  // Pick a featured testimonial if any project has one
  const testimonialProject = allProjects.find((p) => p.testimonial);

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

      {/* Portfolio List — two columns + optional testimonial */}
      <section className="relative pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-3 lg:gap-8">

            {/* Left column */}
            <div className="lg:col-span-1">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Portfolio
              </p>
              <AnimatePresence mode="popLayout">
                {leftCol.map((project, idx) => (
                  <PortfolioRow key={project.slug} project={project} index={idx} />
                ))}
              </AnimatePresence>
            </div>

            {/* Right column */}
            <div className="lg:col-span-1 mt-8 lg:mt-0">
              <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Portfolio
              </p>
              <AnimatePresence mode="popLayout">
                {rightCol.map((project, idx) => (
                  <PortfolioRow key={project.slug} project={project} index={idx + leftCol.length} />
                ))}
              </AnimatePresence>
            </div>

            {/* Testimonial panel */}
            {testimonialProject?.testimonial && (
              <div className="lg:col-span-1 mt-8 lg:mt-0">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Testimonial
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 backdrop-blur-md"
                >
                  {/* Cover image as background */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={testimonialProject.coverImage}
                      alt={testimonialProject.clientName}
                      className="h-full w-full object-cover grayscale"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />
                  </div>

                  {/* Quote */}
                  <div className="p-6 pt-0 -mt-12 relative">
                    <blockquote className="text-sm leading-relaxed text-foreground font-medium">
                      "{testimonialProject.testimonial.quote}"
                    </blockquote>
                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-brand/20 border border-brand/30 flex items-center justify-center text-brand text-xs font-bold">
                        {testimonialProject.testimonial.author.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">
                          {testimonialProject.testimonial.author}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {testimonialProject.testimonial.role}, {testimonialProject.testimonial.organization}
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/work/$slug"
                      params={{ slug: testimonialProject.slug }}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border/60 bg-secondary/40 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary/70 hover:border-brand/30 transition-colors"
                    >
                      Watch Case Study <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </motion.div>
              </div>
            )}

            {/* If no testimonial, show CTA panel instead */}
            {!testimonialProject?.testimonial && (
              <div className="lg:col-span-1 mt-8 lg:mt-0">
                <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                  Start a Project
                </p>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-2xl border border-brand/20 bg-brand/5 p-6 flex flex-col gap-4"
                >
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400 self-start">
                    <ShieldCheck className="h-3.5 w-3.5" /> Production-Grade
                  </div>
                  <h3 className="text-lg font-bold text-foreground leading-snug">
                    Ready to build your next solution?
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    All projects ship in 3–5 weeks. Let's talk about your operational challenge.
                  </p>
                  <BouncyButton
                    href="/contact"
                    className="glow-brand inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-primary-foreground hover:scale-105 transition-transform"
                  >
                    Start a Project <ArrowUpRight className="h-4 w-4" />
                  </BouncyButton>
                </motion.div>
              </div>
            )}
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
