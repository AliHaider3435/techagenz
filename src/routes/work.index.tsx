import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MessageSquare, ArrowUpRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { TechCursor } from "@/components/TechCursor";
import BouncyButton from "@/components/BouncyButton";
import ProjectCard from "@/components/ProjectCard";
import WorkSocialProof from "@/components/WorkSocialProof";
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
});

function WorkPortfolioPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const allProjects = getAllProjects();

  const filteredProjects =
    activeCategory === "All"
      ? allProjects
      : allProjects.filter((p) => p.category === activeCategory);

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
            <Sparkles className="h-3.5 w-3.5" /> Production Portfolio & Case Studies
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
            Every project below represents a live system in active use. Built with transparent architectures, countable metrics, and rapid 3-to-5-week delivery timelines.
          </motion.p>
        </div>
      </section>

      {/* Category Filter Tabs */}
      <section className="relative pb-10">
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

      {/* Portfolio Grid */}
      <section className="relative pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            layout
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 items-stretch"
          >
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((project, idx) => (
                <motion.div
                  key={project.slug}
                  layout
                  className="h-full flex flex-col"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <ProjectCard project={project} priority={idx < 3} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {/* Social Proof Strip & Counter Around Grid */}
          <WorkSocialProof />
        </div>
      </section>

      {/* Trust & CTA Section */}
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
              Whether you need clinical appointment scheduling, automated WhatsApp queue alerts, or a bespoke legal technology portal, we engineer production software designed around your real operational workflows.
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
