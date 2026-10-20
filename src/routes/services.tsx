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
  MessageSquare,
  Rocket,
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
      { title: "Services — Tech Agenz | AI-Powered Software House in Pakistan" },
      {
        name: "description",
        content:
          "Explore Tech Agenz services: Smart Business Automation, WhatsApp Automation for Business, AI Chatbot Development, Custom Software Development, Web Development, and ERPNext Implementation.",
      },
    ],
  }),
  component: ServicesPage,
});

const serviceList = [
  {
    id: "business-automation",
    icon: Cpu,
    tag: "Business Process Automation",
    title: "Smart Business Automation & AI Solutions",
    lead: "Modern businesses need more than traditional software to remain competitive. Tech Agenz helps organizations streamline everyday operations through business process automation, intelligent workflows, and AI-powered applications.",
    img: workSaas,
    imgWidth: 900,
    cardImg: workSaasCard,
    capabilities: [
      "Streamlining everyday operations and reducing manual workloads",
      "Automating customer communication and connecting core business tools",
      "Custom workflow automation for clinics managing patient appointments",
      "Tailored inquiry intake and document workflows for law firms",
    ],
    techStack: ["Python", "FastAPI", "Temporal", "LangGraph", "Redis", "Celery"],
  },
  {
    id: "whatsapp-automation",
    icon: MessageSquare,
    tag: "Customer Communication",
    title: "WhatsApp Automation for Business",
    lead: "Improve customer communication with WhatsApp automation for business. Automated messaging workflows help businesses communicate more efficiently while maintaining a consistent customer experience.",
    img: secureAi,
    imgWidth: 600,
    cardImg: secureAiCard,
    capabilities: [
      "Automated appointment booking and clinic confirmation reminders",
      "Customer inquiry routing and intelligent lead follow-ups",
      "Real-time order updates, shipment notices, and receipt delivery",
      "Instant 24/7 answers to frequently asked questions (FAQs)",
    ],
    techStack: ["WhatsApp Cloud API", "Node.js", "Webhooks", "PostgreSQL", "Docker"],
  },
  {
    id: "ai-chatbots",
    icon: Brain,
    tag: "Intelligent Support",
    title: "AI Chatbot Development",
    lead: "Our AI chatbot development solutions help businesses respond to customer questions, guide website visitors, and provide relevant information around the clock with context-aware interactions.",
    img: workDev,
    imgWidth: 900,
    cardImg: workDevCard,
    capabilities: [
      "Connect chatbots directly with proprietary business knowledge bases",
      "Integrate with customer support desks and CRM workflows",
      "Context-aware, multi-turn conversational agents with sentiment tracking",
      "Escalation to human agents when complex assistance is required",
    ],
    techStack: ["PyTorch", "LangChain", "Qdrant", "OpenAI", "vLLM", "Next.js"],
  },
  {
    id: "custom-software",
    icon: Code2,
    tag: "Tailored Platforms",
    title: "Custom Software Development in Pakistan",
    lead: "Through custom software development in Pakistan, Tech Agenz helps organizations build applications tailored to their workflows, users, and growth plans, addressing operational gaps off-the-shelf tools cannot resolve.",
    img: workData,
    imgWidth: 900,
    cardImg: workDataCard,
    capabilities: [
      "Internal management tools and centralized administrative dashboards",
      "Integrated business platforms unifying fragmented software stacks",
      "Role-based access control, security compliance, and auditing",
      "Architectures engineered specifically for unique operational logic",
    ],
    techStack: ["TypeScript", "React", "Node.js", "PostgreSQL", "Tailwind CSS", "Docker"],
  },
  {
    id: "web-dev",
    icon: Rocket,
    tag: "High-Performance Web",
    title: "Web Development Company in Pakistan",
    lead: "As a web development company in Pakistan, Tech Agenz focuses on building modern, responsive, and functional web applications that support business objectives with top performance and usability.",
    img: workDev,
    imgWidth: 900,
    cardImg: workDevCard,
    capabilities: [
      "Conversion-focused business websites and customer portals",
      "Web-based management systems with sub-second load times",
      "SEO-engineered architectures and 95+ Core Web Vitals guarantees",
      "Responsive, mobile-first design across all device screen sizes",
    ],
    techStack: ["React 19", "TanStack Start", "TypeScript", "Tailwind CSS", "Vite", "REST/GraphQL"],
  },
  {
    id: "erpnext",
    icon: Database,
    tag: "Enterprise Integration",
    title: "ERPNext Implementation",
    lead: "Managing accounting, inventory, sales, purchasing, and other business functions across disconnected systems creates complexity. With ERPNext implementation, businesses bring key processes into an integrated platform.",
    img: workSaas,
    imgWidth: 900,
    cardImg: workSaasCard,
    capabilities: [
      "Centralized accounting, sales pipeline, and purchasing workflows",
      "Real-time inventory tracking and multi-warehouse coordination",
      "Cross-departmental visibility and customized executive reporting",
      "Configured precisely to each organization's operational requirements",
    ],
    techStack: ["ERPNext", "Frappe Framework", "Python", "MariaDB", "Redis", "Linux"],
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
            Simplify Operations. Automate Tasks. <br />
            <span className="text-gradient-brand">Build Smarter Experiences.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            Tech Agenz helps businesses streamline everyday operations through business process automation, intelligent workflows, and AI-powered applications that connect people, processes, and systems to support long-term growth.
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
