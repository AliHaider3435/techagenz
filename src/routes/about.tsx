import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Rocket,
  Shield,
  Zap,
  Target,
  Users,
  Award,
  ArrowUpRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BouncyButton from "@/components/BouncyButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import { TechCursor } from "@/components/TechCursor";
import TeamSection from "@/components/TeamSection";
import { AnimatedTestimonialsDemo } from "@/components/ui/animated-testimonials";
import workDev from "@/assets/work-dev.webp";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Tech Agenz | AI-Powered Software House" },
      {
        name: "description",
        content:
          "Learn about Tech Agenz: our mission, values, engineering discipline, leadership team, and track record in delivering 50+ AI and software projects.",
      },
    ],
  }),
  component: AboutPage,
});

const values = [
  {
    icon: Target,
    title: "Production-First AI",
    desc: "We don't build toy prototypes. We design resilient, observable, cost-effective AI systems architected to withstand heavy real-world usage.",
  },
  {
    icon: Shield,
    title: "Engineering Rigor",
    desc: "Strict type-safety, automated testing, defensive error boundaries, and cloud-native security are built into every single codebase from day one.",
  },
  {
    icon: Zap,
    title: "Velocity & Agility",
    desc: "Modern tooling and iterative sprints allow us to prototype in days and ship battle-tested production platforms in weeks, not quarters.",
  },
  {
    icon: Users,
    title: "Direct Partnership",
    desc: "You collaborate directly with the engineers architecting and writing your systems. No bureaucratic layers or telephone games.",
  },
];

const stats = [
  {
    value: "50+",
    label: "Projects Delivered",
    desc: "Production AI systems, specialized healthcare portals, legal tech platforms, and high-load web applications.",
  },
  {
    value: "6+",
    label: "Years Building",
    desc: "Dedicated to crafting resilient software — scaling from early startup prototypes to mature institutional deployments.",
  },
  {
    value: "98%",
    label: "Client Satisfaction",
    desc: "A track record built on long-term client relationships and systems that perform reliably year after year.",
  },
];

function AboutPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <TechCursor />
      <WhatsAppButton />
      <Nav />

      {/* Hero Header */}
      <section className="relative pt-36 pb-16">
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
        <div className="relative mx-auto max-w-5xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs uppercase tracking-widest text-brand"
          >
            <Sparkles className="h-3.5 w-3.5" /> About Tech Agenz
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-hero mt-5 text-4xl font-bold uppercase sm:text-6xl"
          >
            Architecting the Future with <br />
            <span className="text-gradient-brand">Intelligent Engineering</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            Tech Agenz is an AI-powered software house founded to bridge the gap between cutting-edge artificial intelligence
            and dependable, mission-critical production systems.
          </motion.p>
        </div>
      </section>

      {/* Story & Philosophy */}
      <section className="relative py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="glass-card overflow-hidden rounded-3xl p-2">
                <img
                  src={workDev}
                  alt="Tech Agenz engineering team at work"
                  width={900}
                  height={700}
                  className="rounded-2xl"
                  loading="lazy"
                />
              </div>
              <div className="glass-card absolute -bottom-6 -right-6 hidden rounded-2xl px-5 py-4 sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/20 ring-1 ring-brand/40">
                    <Rocket className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Shipping since 2018</div>
                    <div className="text-xs text-muted-foreground">Trusted by teams worldwide</div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl">
                We believe applied AI should be <span className="text-gradient-brand">reliable, fast, and practical</span>.
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Too many AI projects remain stuck in research experiments or brittle demo prototypes that fail when presented with real-world edge cases. At Tech Agenz, we apply sound software engineering principles to AI development.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Whether deploying autonomous clinic appointment scheduling systems, legal tech consultation portals, or high-throughput enterprise pipelines, we take end-to-end accountability for performance, data security, and long-term maintainability.
              </p>
              <div className="pt-2">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
                >
                  Work with our team <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              Principles That <span className="text-gradient-brand">Guide Us</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              How we approach every architectural decision, codebase, and client partnership.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <motion.div
                  key={v.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="glass-card flex flex-col justify-between rounded-2xl p-6 transition-all duration-300 hover:border-brand/40"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-brand/30">
                      <Icon className="h-6 w-6 text-brand" />
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold">{v.title}</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{v.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border/60 bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 px-8 py-16 sm:px-14 sm:py-20">
            <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand/20 blur-[100px]" />
            <div className="relative grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs uppercase tracking-widest text-brand">
                  <Award className="h-3 w-3" /> Proven Track Record
                </div>
                <h2 className="mt-4 font-display text-3xl font-semibold text-white sm:text-5xl">
                  Numbers that reflect <span className="text-gradient-brand">how we build</span>
                </h2>
                <p className="mt-5 text-sm text-slate-400 sm:text-base">
                  Every metric is earned across production environments. It is what happens when deep engineering discipline meets applied AI.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {stats.map((s, idx) => (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
                  >
                    <div>
                      <div className="font-display text-3xl font-bold text-white sm:text-4xl">{s.value}</div>
                      <div className="mt-1 text-sm font-medium text-slate-300">{s.label}</div>
                    </div>
                    <p className="mt-3 text-xs leading-relaxed text-slate-400">{s.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership & Engineering Team */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-6">
          <TeamSection />
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs uppercase tracking-widest text-brand">
              <Sparkles className="h-3 w-3" /> Testimonials
            </div>
            <h2 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
              What our <span className="text-gradient-brand">partners</span> say
            </h2>
          </div>
          <div className="mt-12">
            <AnimatedTestimonialsDemo />
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="relative py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Ready to collaborate?</h2>
          <p className="mt-3 text-muted-foreground">Let's discuss your roadmap and engineer the systems to get you there.</p>
          <div className="mt-8 flex justify-center">
            <BouncyButton
              href="/contact"
              className="glow-brand inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-primary-foreground"
            >
              Get in touch <ArrowUpRight className="h-4 w-4" />
            </BouncyButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AboutPage;
