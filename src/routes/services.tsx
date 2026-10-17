import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Brain,
  Cpu,
  Code2,
  Database,
  ArrowUpRight,
  Sparkles,
  CheckCircle2,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  Terminal,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BouncyButton from "@/components/BouncyButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import { TechCursor } from "@/components/TechCursor";
import secureAi from "@/assets/secure-ai.webp";
import secureAiCard from "@/assets/secure-ai-card.webp";
import workDev from "@/assets/work-dev.webp";
import workDevCard from "@/assets/work-dev-card.webp";
import workSaas from "@/assets/work-saas.webp";
import workSaasCard from "@/assets/work-saas-card.webp";
import workData from "@/assets/work-data.webp";
import workDataCard from "@/assets/work-data-card.webp";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Tech Agenz | AI & Applied Engineering" },
      {
        name: "description",
        content:
          "Explore Tech Agenz services: AI & ML Engineering, Intelligent Automation, Full-Stack Web Applications, and Real-Time Data Infrastructure.",
      },
    ],
  }),
  component: ServicesPage,
});

const serviceList = [
  {
    id: "ai-ml",
    icon: Brain,
    tag: "AI & Machine Learning",
    title: "Intelligent AI & ML Systems",
    lead: "Custom models, domain-specific RAG pipelines, and vision intelligence engineered for high-throughput production.",
    img: secureAi,
    imgWidth: 600,
    cardImg: secureAiCard,
    capabilities: [
      "Enterprise Retrieval-Augmented Generation (RAG) with semantic re-ranking",
      "Model fine-tuning and distillation (Llama, Mistral, DeepSeek)",
      "High-accuracy computer vision and automated document extraction",
      "MLOps, low-latency inference caching, and model monitoring",
    ],
    techStack: ["PyTorch", "LangChain", "Qdrant", "Hugging Face", "OpenAI", "vLLM"],
  },
  {
    id: "automation",
    icon: Cpu,
    tag: "Intelligent Automation",
    title: "Autonomous Agentic Workflows",
    lead: "Self-healing pipelines and multi-agent systems that replace manual bottlenecks with deterministic speed.",
    img: workSaas,
    imgWidth: 900,
    cardImg: workSaasCard,
    capabilities: [
      "Multi-agent autonomous workflows for operations and support",
      "End-to-end API orchestration between CRMs, ERPs, and databases",
      "Event-driven background task processing with automated recovery",
      "Custom RPA and intelligent notification dispatching",
    ],
    techStack: ["Python", "FastAPI", "Temporal", "LangGraph", "Redis", "Celery"],
  },
  {
    id: "web-dev",
    icon: Code2,
    tag: "Full-Stack Web",
    title: "High-Performance Web Platforms",
    lead: "Modern, responsive, and SEO-engineered web applications designed for conversion and global scale.",
    img: workDev,
    imgWidth: 900,
    cardImg: workDevCard,
    capabilities: [
      "Production React 19, TanStack Start, and Next.js applications",
      "Real-time reactive features using WebSockets and streaming protocols",
      "Scalable REST and GraphQL backend architectures",
      "Sub-second load times and 95+ Core Web Vitals guarantees",
    ],
    techStack: ["TypeScript", "React", "Node.js", "Tailwind CSS", "PostgreSQL", "Docker"],
  },
  {
    id: "data-solutions",
    icon: Database,
    tag: "Data Solutions",
    title: "Data Infrastructure & Analytics",
    lead: "Robust telemetry ingestion, warehousing, and executive intelligence dashboards that turn raw signals into decisions.",
    img: workData,
    imgWidth: 900,
    cardImg: workDataCard,
    capabilities: [
      "Real-time streaming and batch ETL/ELT pipelines",
      "Analytical warehousing with sub-second queries on large datasets",
      "Interactive executive dashboards and predictive visual modeling",
      "Automated schema validation, deduplication, and data hygiene",
    ],
    techStack: ["ClickHouse", "PostgreSQL", "DuckDB", "Apache Kafka", "Python", "Metabase"],
  },
];

const processSteps = [
  {
    step: "01",
    title: "Discovery & System Architecture",
    desc: "We dive deep into your workflow, pain points, and requirements to blueprint the exact data flow, AI models, and infrastructure stack.",
  },
  {
    step: "02",
    title: "Rapid Interactive Prototyping",
    desc: "We build a working PoC in days, validating feasibility, response times, model accuracy, and user interaction before full rollout.",
  },
  {
    step: "03",
    title: "Production Engineering & Hardening",
    desc: "We write clean, modular, typed code with edge-case handling, automated rate limiting, security compliance, and robust error recovery.",
  },
  {
    step: "04",
    title: "Deployment & Continuous Evolution",
    desc: "We deploy to high-availability cloud infrastructure with CI/CD automation, real-time observability, and ongoing performance tuning.",
  },
];

function ServicesPage() {
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
            <Sparkles className="h-3.5 w-3.5" /> Capabilities & Solutions
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-hero mt-5 text-4xl font-bold uppercase sm:text-6xl"
          >
            Engineering Systems That <br />
            <span className="text-gradient-brand">Think, Automate & Scale</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            From custom AI models and autonomous agentic workflows to high-throughput web platforms and data pipelines,
            we engineer solutions that deliver measurable competitive advantages.
          </motion.p>
        </div>
      </section>

      {/* Services Breakdown */}
      <section className="relative py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="space-y-16">
            {serviceList.map((service, index) => {
              const Icon = service.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6 }}
                  className={`grid items-center gap-10 rounded-3xl border border-border/60 bg-card/40 p-8 backdrop-blur-xl lg:grid-cols-2 lg:p-12 ${
                    isEven ? "" : "lg:grid-flow-dense"
                  }`}
                >
                  {/* Text Details */}
                  <div className={isEven ? "" : "lg:col-start-2"}>
                    <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand ring-1 ring-brand/30">
                      <Icon className="h-3.5 w-3.5" />
                      {service.tag}
                    </div>
                    <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl lg:text-4xl">
                      {service.title}
                    </h2>
                    <p className="mt-3 text-muted-foreground">{service.lead}</p>

                    <div className="mt-6 space-y-2.5">
                      {service.capabilities.map((cap, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                          <span className="text-foreground/90">{cap}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2 pt-2">
                      {service.techStack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-border/80 bg-background/80 px-3 py-1 text-xs text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="mt-8">
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
                      >
                        Consult on {service.tag} <ArrowUpRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Visual Image */}
                  <div className={isEven ? "" : "lg:col-start-1"}>
                    <div className="group relative overflow-hidden rounded-2xl border border-border/60">
                      <img
                        src={service.img}
                        srcSet={`${service.cardImg} 480w, ${service.img} ${service.imgWidth}w`}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        alt={service.title}
                        loading="lazy"
                        className="h-80 w-full object-cover transition-transform duration-700 group-hover:scale-105 sm:h-96"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="glass-card inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium text-brand backdrop-blur-md">
                          <Zap className="h-3.5 w-3.5" /> Production-Ready Architecture
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Engineering Process */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs uppercase tracking-widest text-brand">
              <Layers className="h-3 w-3" /> How We Build
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-5xl">
              From Concept to <span className="text-gradient-brand">Production</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              A disciplined, transparent engineering methodology designed for high-velocity execution and zero regressions.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, idx) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass-card relative flex flex-col justify-between rounded-2xl p-6"
              >
                <div>
                  <span className="font-display text-3xl font-extrabold text-brand/80">{step.step}</span>
                  <h3 className="mt-3 font-display text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <div className="glass-card relative overflow-hidden rounded-3xl p-10 sm:p-16">
            <h2 className="font-display text-3xl font-bold sm:text-5xl">
              Have a technical challenge in mind?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Schedule a technical discovery session with our lead engineers to assess feasibility, architecture, and timeline.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <BouncyButton
                href="/contact"
                className="glow-brand inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-primary-foreground"
              >
                Start a project <ArrowUpRight className="h-4 w-4" />
              </BouncyButton>
              <Link
                to="/work"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-6 py-3 text-sm hover:bg-card"
              >
                View our work
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ServicesPage;
