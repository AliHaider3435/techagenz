import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
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
      { title: "Our Work — Tech Agenz" },
      { name: "description", content: "Explore the AI, automation, web, and healthcare platforms Tech Agenz has engineered for clients worldwide." },
    ],
  }),
  component: WorkPage,
});

const projects = [
  {
    img: garwanLawChamber,
    tag: "Legal Tech",
    title: "Garwan Law Chamber",
    desc: "Comprehensive legal practice portal with client consultations, attorney profiles, and appointment management.",
    details: "Designed and engineered an authoritative digital platform for Garwan Law Chamber. Features include online consultation scheduling, client case intake workflows, practice area directories, and secure document sharing.",
    stack: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
  },
  {
    img: drIqbalKharal,
    tag: "Booking Systems",
    title: "Dr Iqbal Ahmad Kharal Appointment Booking System",
    desc: "Clinical appointment scheduling platform with patient queue management and real-time consultation tracking.",
    details: "Built an end-to-end appointment scheduling and clinic operations system for Dr. Iqbal Ahmad Kharal. Features patient time-slot reservation, queue status tracking, doctor schedule controls, and automated SMS/WhatsApp alerts.",
    stack: ["React", "Node.js", "PostgreSQL", "Calendar API"],
  },
  {
    img: drSajidSohail,
    tag: "Healthcare",
    title: "Dr Sajid Sohail Appointment Booking System",
    desc: "Clinical appointment booking and patient consultation workflow system for Rahmania Medical Center.",
    details: "Developed a modern, responsive patient appointment scheduling platform for Dr. Sajid Sohail at Rahmania Medical Center. Features real-time consultation slot reservations, daily 15-minute time-slot selection, patient intake questionnaires, and automated clinic confirmations.",
    stack: ["React", "TypeScript", "Tailwind CSS", "REST API"],
  },
];

const categories = ["All", "Legal Tech", "Booking Systems", "Healthcare"];

function ProjectCard({ p, index }: { p: (typeof projects)[number]; index: number }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      whileHover={{ y: -8 }}
      className="group relative rounded-3xl"
    >
      {/* rotating edge-light layer */}
      <div className="pointer-events-none absolute -inset-[1px] overflow-hidden rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div
          className="absolute inset-[-60%] animate-spin"
          style={{
            animationDuration: "3.5s",
            background:
              "conic-gradient(from 0deg, transparent 0%, oklch(0.7 0.19 240) 8%, oklch(0.85 0.15 240) 12%, transparent 24%, transparent 100%)",
          }}
        />
      </div>

      {/* card body sits on top, leaving a 1px ring for the light to show through */}
      <div className="glass-card relative m-[1px] overflow-hidden rounded-3xl">
        <div className="relative aspect-[16/10] overflow-hidden">
          <motion.img
            src={p.img}
            alt={p.title}
            className="h-full w-full object-cover"
            transition={{ duration: 0.6, ease: "easeOut" }}
            whileHover={{ scale: 1.08 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
          <div className="absolute left-4 top-4 rounded-full bg-background/70 px-3 py-1 text-xs uppercase tracking-widest text-brand backdrop-blur">
            {p.tag}
          </div>
        </div>

        <div className="relative p-6">
          <h3 className="font-display text-xl font-semibold transition-colors duration-300 group-hover:text-brand">
            {p.title}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
          <p className="mt-4 text-sm text-muted-foreground">{p.details}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {p.stack.map((s) => (
              <span
                key={s}
                className="rounded-full bg-brand/10 px-3 py-1 text-xs text-brand ring-1 ring-brand/20 transition-colors duration-300 hover:bg-brand/20"
              >
                {s}
              </span>
            ))}
          </div>

          <Link to="/contact" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-brand transition-colors hover:underline">
            Inquire about this project
            <motion.span className="inline-flex" initial={{ x: 0 }} whileHover={{ x: 4 }}>
              <ArrowUpRight className="h-4 w-4" />
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

function WorkPage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProjects =
    activeCategory === "All" ? projects : projects.filter((p) => p.tag === activeCategory);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <TechCursor />
      <WhatsAppButton />
      <Nav />

      <section className="relative pt-40 pb-10">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs uppercase tracking-widest text-brand"
          >
            <Sparkles className="h-3 w-3" /> Our Work
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-6xl"
          >
            Products & platforms we've <span className="text-gradient-brand">engineered</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-muted-foreground"
          >
            A closer look at the AI, automation, web, and data systems we've shipped for clients across industries and continents.
          </motion.p>
        </div>
      </section>

      <section className="relative pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative rounded-full px-4 py-2 text-sm transition-colors duration-300 ${
                    isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-category-pill"
                      className="absolute inset-0 rounded-full bg-brand glow-brand"
                      transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative pb-28">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div layout className="grid gap-8 md:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {filteredProjects.map((p, i) => (
                <ProjectCard key={p.title} p={p} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredProjects.length === 0 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16 text-center text-muted-foreground">
              No projects in this category yet.
            </motion.p>
          )}
        </div>
      </section>

      <section className="relative pb-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Have a project in mind?</h2>
          <p className="mt-3 text-muted-foreground">Let's talk about what we can engineer for you next.</p>
          <div className="mt-6 flex justify-center">
            <BouncyButton
              href="/contact"
              className="glow-brand inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              Start a project <ArrowUpRight className="h-4 w-4" />
            </BouncyButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default WorkPage;