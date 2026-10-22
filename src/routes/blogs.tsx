import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowUpRight,
  Search,
  Sparkles,
  Tag,
  CheckCircle,
  MessageSquare,
  Layers,
  ChevronRight,
  Share2,
  Bookmark,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { TechCursor } from "@/components/TechCursor";

export const Route = createFileRoute("/blogs")({
  head: () => ({
    meta: [
      {
        title:
          "Tech Agenz Blog — Insights, AI Engineering & Custom Software Development in Pakistan",
      },
      {
        name: "description",
        content:
          "Authoritative engineering insights on AI software house services, custom software development in Pakistan, ERPNext implementation, WhatsApp business automation, and enterprise web architectures.",
      },
      {
        name: "keywords",
        content:
          "Software House in Pakistan, AI Software House, Custom Software Development Pakistan, ERPNext Implementation, WhatsApp Automation for Business, AI Chatbot Development, Web Development Company Pakistan, Offshore Software Development, Dedicated Engineering Teams",
      },
      {
        property: "og:title",
        content: "Tech Agenz Blog — Software Engineering & AI Automation Insights",
      },
      {
        property: "og:description",
        content:
          "Practical blueprints, architectural deep dives, and production case studies for businesses scaling with modern AI, custom software, and ERPNext.",
      },
      { property: "og:url", content: "https://www.techagenz.com/blogs" },
    ],
    links: [
      { rel: "canonical", href: "https://www.techagenz.com/blogs" },
    ],
  }),
  component: BlogsPage,
});

export interface BlogPost {
  id: string;
  title: string;
  category: "AI & ML" | "Custom Software" | "Automation" | "Enterprise ERP" | "Industry Solutions";
  readTime: string;
  date: string;
  author: string;
  excerpt: string;
  image: string;
  keywords: string[];
  keyTakeaways: string[];
  content: string[];
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: "ai-software-house-pakistan",
    title: "Why AI-Powered Software Houses in Pakistan Are Dominating Global Tech Delivery",
    category: "AI & ML",
    readTime: "6 min read",
    date: "Oct 20, 2026",
    author: "Ali Haider, Founder & AI Engineer",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
    keywords: [
      "AI Software House",
      "Software House in Pakistan",
      "AI Engineering",
      "Global Tech Outsourcing",
      "Custom AI Development",
    ],
    excerpt:
      "How forward-thinking engineering teams in Pakistan are combining large language model orchestration, autonomous agentic workflows, and competitive delivery economics to build world-class enterprise software.",
    keyTakeaways: [
      "Pakistan is producing over 25,000 top-tier IT and AI graduates annually with deep bilingual technical competence.",
      "Traditional outsourcing models are shifting to AI-augmented development cycles, cutting delivery timeframes by 40-50%.",
      "Businesses partnering with specialized AI software houses gain customized intellectual property rather than generic third-party SaaS wrappers.",
    ],
    content: [
      "The global software development landscape has reached an inflection point. Organizations in North America, Europe, and the Middle East no longer seek conventional code factories; they need strategic AI engineering partners who understand model integration, data isolation, and modern operational ergonomics.",
      "In Pakistan, a new generation of software houses like Tech Agenz is leading this transformation. By combining state-of-the-art frameworks like PyTorch, vLLM, and LangGraph with robust full-stack web architectures, we deliver customized intelligent solutions that directly integrate into business operations.",
      "Whether you are building bespoke generative workflows, intelligent legal portals, or clinical automation systems, partnering with a dedicated Pakistani AI software house yields tier-1 engineering quality at a fraction of Western agency cost structures.",
    ],
    featured: true,
  },
  {
    id: "custom-software-development-pakistan",
    title: "Custom Software Development vs Off-The-Shelf SaaS: The 2026 Decision Blueprint",
    category: "Custom Software",
    readTime: "7 min read",
    date: "Oct 18, 2026",
    author: "Tech Agenz Engineering Team",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80",
    keywords: [
      "Custom Software Development Pakistan",
      "Bespoke Business Software",
      "SaaS vs Custom",
      "Enterprise Platforms",
      "Scalable Systems",
    ],
    excerpt:
      "When do subscription SaaS limits stall your operational scale? An architectural breakdown of ROI, intellectual property ownership, and integration advantages of bespoke custom software platforms.",
    keyTakeaways: [
      "Off-the-shelf software incurs rising recurring subscription costs as employee headcount and data volume scale.",
      "Custom software maps 100% to your company's proprietary operational logic, eliminating awkward manual workarounds.",
      "Full ownership of code, database architecture, and security protocols guarantees compliance and creates company valuation value.",
    ],
    content: [
      "Many growing businesses start by assembling a patchwork of monthly SaaS tools: one for CRM, one for inventory, another for appointments, and spreadsheets to bridge the gaps. Within two years, subscription costs balloon, data becomes siloed, and teams waste hours copying information across disconnected tabs.",
      "Custom software development solves this structural ceiling. When you build with a partner like Tech Agenz, every database table, API endpoint, and dashboard interface is designed exclusively to automate your exact operational requirements.",
      "From role-based staff dashboards to unified customer service pipelines, custom software transforms fragmented workflows into an unfair competitive advantage.",
    ],
  },
  {
    id: "whatsapp-automation-for-business",
    title: "WhatsApp Business Automation: How Clinics, Law Firms, and Retailers Automate 80% of Inquiries",
    category: "Automation",
    readTime: "5 min read",
    date: "Oct 15, 2026",
    author: "Muhammad Faizan, Automation Engineer",
    image:
      "https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=1200&q=80",
    keywords: [
      "WhatsApp Automation for Business",
      "WhatsApp Cloud API",
      "Customer Support AI",
      "Automated Appointment Booking",
      "Lead Generation WhatsApp",
    ],
    excerpt:
      "A complete guide to automated appointment booking, payment receipts, instant lead capture, and CRM syncing via the official Meta WhatsApp Cloud API.",
    keyTakeaways: [
      "WhatsApp boasts an open rate of 98% compared to traditional email's 20%, resulting in instant customer engagement.",
      "Official Meta WhatsApp Cloud API webhooks enable instant, 24/7 automated qualification and appointment booking.",
      "Automated WhatsApp reminders reduce customer no-shows and missed appointments by upwards of 45%.",
    ],
    content: [
      "Customer attention has permanently shifted from crowded email inboxes to instant messaging. In emerging and international markets alike, WhatsApp is the dominant communication channel for customer discovery, transactions, and support.",
      "By integrating the official Meta WhatsApp Cloud API with intelligent backend webhooks, Tech Agenz empowers businesses to answer customer queries, schedule doctor visits, send delivery updates, and collect lead information automatically within seconds.",
      "The result is happier customers, 24/7 responsiveness without hiring night-shift support agents, and instant CRM synchronization.",
    ],
  },
  {
    id: "erpnext-implementation-pakistan",
    title: "Complete Guide to ERPNext Implementation: Unifying Accounts, Inventory, & HR",
    category: "Enterprise ERP",
    readTime: "8 min read",
    date: "Oct 12, 2026",
    author: "Tech Agenz Solutions Team",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    keywords: [
      "ERPNext Implementation Pakistan",
      "Frappe Framework",
      "Open Source ERP",
      "Enterprise Management Software",
      "Inventory Accounting System",
    ],
    excerpt:
      "Ditch disconnected spreadsheets and costly licensing fees. How ERPNext delivers full operational visibility with zero per-user software licensing overhead.",
    keyTakeaways: [
      "ERPNext eliminates expensive recurring license fees typical of SAP, Microsoft Dynamics, and Oracle.",
      "Built on the modern Python-based Frappe Framework, enabling deep customizations and REST API integrations.",
      "Unified modules cover general ledger accounting, warehouse multi-location inventory, procurement, and HR payroll.",
    ],
    content: [
      "Managing business accounting in one software, inventory in another, and human resources in Excel sheets is the primary cause of inventory discrepancies, cash flow bottlenecks, and delayed financial reporting.",
      "ERPNext is an enterprise-grade, open-source resource planning suite built on Python and MariaDB. Unlike proprietary ERPs that charge thousands of dollars per user per month, ERPNext offers complete architectural freedom and zero licensing lock-in.",
      "At Tech Agenz, our ERPNext implementation methodology includes workflow gap analysis, data migration from legacy accounting systems, custom doctype development, and intensive staff training to ensure rapid company-wide adoption.",
    ],
  },
  {
    id: "ai-chatbot-development-rag",
    title: "Enterprise AI Chatbot Development: Building RAG Pipelines That Don't Hallucinate",
    category: "AI & ML",
    readTime: "6 min read",
    date: "Oct 09, 2026",
    author: "Muhammad Rizwan, Data Scientist",
    image:
      "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=1200&q=80",
    keywords: [
      "AI Chatbot Development",
      "RAG Architecture",
      "Enterprise AI",
      "Vector Database",
      "Context-Aware Chatbots",
    ],
    excerpt:
      "Eliminating vector collision and inaccurate generative responses using hybrid BM25 + dense vector search, cross-encoder re-ranking, and strict business guardrails.",
    keyTakeaways: [
      "Naive vector search RAG setups frequently fail when enterprise knowledge bases exceed thousands of documents.",
      "Hybrid search (BM25 sparse keywords + dense embeddings) captures both exact technical terminology and semantic intent.",
      "Cross-encoder re-ranking and prompt guardrails deliver 99%+ factual accuracy with deterministic business logic.",
    ],
    content: [
      "Deploying a chatbot powered by standard large language models is simple, but ensuring it never provides incorrect product details, hallucinated pricing, or sensitive internal data is a serious engineering challenge.",
      "At Tech Agenz, we architect production-grade Retrieval-Augmented Generation (RAG) pipelines. By chunking internal PDFs, manuals, and customer FAQs into vector databases (like Qdrant or pgvector) and applying reciprocal rank fusion, we ensure the language model only responds based on your verified knowledge base.",
      "Furthermore, our chatbots include seamless fallback escalation to human operators whenever a query requires nuanced personal assistance.",
    ],
  },
  {
    id: "healthcare-clinic-management-software",
    title: "Digitizing Medical Clinics: How Real-Time Appointment Systems Stop Patient No-Shows",
    category: "Industry Solutions",
    readTime: "5 min read",
    date: "Oct 05, 2026",
    author: "Ali Haider, Founder",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
    keywords: [
      "Healthcare Software Pakistan",
      "Clinic Management Software",
      "Doctor Appointment Booking System",
      "Patient Queue Automation",
      "Hospital Management System",
    ],
    excerpt:
      "Real-world case study of digitizing medical consultations for Dr. Iqbal Ahmad Kharal and Dr. Sajid Sohail—reducing patient wait times by 42% and eliminating missed slots.",
    keyTakeaways: [
      "Walk-in chaos and clinic waiting room overcrowding directly harm patient experience and doctor productivity.",
      "Atomic database slot reservation prevents accidental double-bookings during peak booking surges.",
      "Multi-channel automated notifications (WhatsApp, SMS) keep patients informed of real-time queue status.",
    ],
    content: [
      "Healthcare practices in metropolitan hubs handle hundreds of patients daily. Without digital scheduling, clinic waiting rooms become overcrowded, reception staff are overwhelmed with phone calls, and doctors face erratic daily consultation hours.",
      "In our bespoke healthcare software implementations for Dr. Iqbal Ahmad Kharal and Dr. Sajid Sohail, Tech Agenz engineered a modern web-based booking portal paired with an intuitive doctor schedule dashboard.",
      "Patients can view available time slots, book appointments in seconds on mobile devices, and receive instant confirmation details via WhatsApp. The result has been a 42% decrease in clinic wait times and near-zero missed appointments.",
    ],
  },
  {
    id: "legal-tech-law-chamber-portals",
    title: "Legal Tech for Law Chambers: Engineering Secure Client Portals & Case Intake Workflows",
    category: "Industry Solutions",
    readTime: "5 min read",
    date: "Sep 28, 2026",
    author: "Ali Haider, Founder",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80",
    keywords: [
      "Legal Tech Software",
      "Law Firm Management System",
      "Advocate Case Portal",
      "Client Intake Automation",
      "Legal Practice Pakistan",
    ],
    excerpt:
      "How Garwan Law Chamber modernized client consultations, confidential case intake, and advocate profiles with an authoritative digital legal tech portal.",
    keyTakeaways: [
      "Modern legal clients expect confidential, frictionless digital intake before stepping into a physical law office.",
      "Structured inquiry forms ensure attorneys receive critical case facts, jurisdiction details, and documentation upfront.",
      "A fast, authoritative digital portal establishes immediate credibility and differentiates modern law chambers.",
    ],
    content: [
      "Legal practices depend on trust, confidentiality, and authority. Traditional law firms often rely on word of mouth or informal messaging, which leaves prospective clients unsure of practice specialties and intake procedures.",
      "For Garwan Law Chamber, Tech Agenz built a bespoke legal portal that highlights practice areas, attorney credentials, and structured case intake workflows.",
      "Prospective corporate and private clients can review attorney expertise, securely submit case inquiries, and schedule consultations with the chamber's senior advocates.",
    ],
  },
  {
    id: "react-19-web-development-pakistan",
    title: "Building Sub-Second Web Applications: React 19, TanStack Start & Tailwind CSS",
    category: "Custom Software",
    readTime: "6 min read",
    date: "Sep 22, 2026",
    author: "Tech Agenz Engineering Team",
    image:
      "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=80",
    keywords: [
      "Web Development Company in Pakistan",
      "React 19 Development",
      "TanStack Start SSR",
      "Core Web Vitals Optimization",
      "Frontend Architecture",
    ],
    excerpt:
      "A masterclass in modern web engineering: sub-second initial paint, 0ms Total Blocking Time, and server-side rendering for flawless Core Web Vitals and top Google search rankings.",
    keyTakeaways: [
      "Google's search ranking algorithm prioritizes websites that achieve green Core Web Vitals scores (LCP, INP, CLS).",
      "Modern full-stack frameworks like TanStack Start combine server-rendered speed with client-side interactive smoothness.",
      "Converting legacy heavy assets to WebP and deferring non-critical 3D scripts delivers 95+ Lighthouse mobile ratings.",
    ],
    content: [
      "In modern web development, speed is not merely a technical vanity metric—it directly determines bounce rates, conversion percentages, and Google search ranking visibility. Studies show that a 1-second delay in page load time can reduce conversions by up to 20%.",
      "At Tech Agenz, we specialize in building fast, scalable web platforms using React 19, TanStack Start, and Tailwind CSS. By adopting server-side rendering (SSR), critical CSS inlining, and asset preloading, our platforms consistently score 95+ on Google Lighthouse audits.",
      "Whether developing high-volume commercial portals or internal enterprise dashboards, our web engineering guarantees instantaneous response times across all mobile and desktop devices.",
    ],
  },
  {
    id: "autonomous-agentic-workflows-temporal",
    title: "From Brittle Cron Scripts to Self-Healing Autonomous Agentic Workflows",
    category: "Automation",
    readTime: "7 min read",
    date: "Sep 16, 2026",
    author: "Tech Agenz Solutions Team",
    image:
      "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
    keywords: [
      "Autonomous AI Agents",
      "Workflow Automation",
      "Temporal & LangGraph",
      "Fault-Tolerant Pipelines",
      "Software House Automation",
    ],
    excerpt:
      "Why legacy cron scripts crash under edge cases and how stateful, event-driven multi-agent systems automatically retry, heal, and recover without data loss or human intervention.",
    keyTakeaways: [
      "Single-threaded cron jobs lack state durability; if a network request drops, data processing fails silently.",
      "Stateful orchestrators like Temporal and LangGraph checkpoint every operational step into persistent event history.",
      "Autonomous agent pipelines handle complex data intake, validation, and multi-system syncing with zero human intervention.",
    ],
    content: [
      "Most software systems still rely on fragile cron jobs and stateless webhook listeners. When a third-party payment gateway or CRM API experiences temporary downtime, background sync jobs fail silently, causing corrupted records and angry customers.",
      "Tech Agenz engineers self-healing, event-driven autonomous workflows. By utilizing orchestrators such as Temporal and LangGraph, each pipeline step is deterministically checkpointed.",
      "If an external service is unavailable, our pipelines automatically queue exponential backoff retries without restarting the transaction, ensuring 99.99% operational continuity for business-critical processes.",
    ],
  },
  {
    id: "offshore-software-development-pakistan",
    title: "Why Global Companies Outsource Software Engineering to Pakistan in 2026",
    category: "Custom Software",
    readTime: "6 min read",
    date: "Sep 10, 2026",
    author: "Ali Haider, Founder",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    keywords: [
      "Offshore Software Development",
      "IT Outsourcing Pakistan",
      "Hire Dedicated Developers",
      "Software House Services",
      "Global Tech Partner",
    ],
    excerpt:
      "With over 300,000 certified IT professionals and high English fluency, Pakistan has emerged as a premier hub for high-quality, cost-efficient software and AI development.",
    keyTakeaways: [
      "Pakistan is ranked among the top 4 fastest-growing software development talent ecosystems globally.",
      "Overlap with European, Gulf (GCC), and North American working hours enables seamless agile sprint collaboration.",
      "Hiring dedicated development squads through Tech Agenz reduces engineering overhead by 60% compared to local domestic hires.",
    ],
    content: [
      "The rapid rise of remote collaboration tools has transformed how venture-backed startups and established enterprises hire technical talent. Rather than paying exorbitant Silicon Valley or European contractor rates, forward-thinking CTOs are establishing dedicated development centers in Pakistan.",
      "With strong university curricula in computer science, a population of over 240 million, and deep proficiency in Python, React, cloud engineering, and machine learning, Pakistan delivers exceptional engineering talent.",
      "At Tech Agenz, our offshore dedicated developer model provides international founders with senior engineers, daily synchronous standups, automated CI/CD pipelines, and clear IP ownership from day one.",
    ],
  },
  {
    id: "saas-architecture-multi-tenancy",
    title: "SaaS Architecture Blueprint: Multi-Tenancy, Cloud DevOps, and Data Isolation",
    category: "Custom Software",
    readTime: "8 min read",
    date: "Sep 03, 2026",
    author: "Tech Agenz Architecture Team",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    keywords: [
      "SaaS Product Development",
      "Multi-Tenant Architecture",
      "Cloud Infrastructure",
      "DevOps & Docker",
      "Scalable SaaS Pakistan",
    ],
    excerpt:
      "A technical deep dive into designing multi-tenant databases, shared vs isolated schemas, zero-downtime deployment pipelines, and global subscription monetization.",
    keyTakeaways: [
      "Tenant data isolation strategy (database-per-tenant vs schema-per-tenant vs shared database with row-level security).",
      "Containerized deployment using Docker and Kubernetes ensures effortless vertical and horizontal autoscaling.",
      "Automated subscription billing, tiered permission roles, and tenant usage metrics must be architected from day one.",
    ],
    content: [
      "Transitioning an idea into a scalable Software-as-a-Service (SaaS) product requires more than building frontend features. Founders must make foundational architectural decisions regarding multi-tenant security, tenant onboarding, and billing infrastructure.",
      "In this guide, we explore the trade-offs between shared and isolated tenant databases. For enterprise SaaS applications handling financial or healthcare records, schema-level separation with row-level security (RLS) offers the optimal balance of privacy and server resource efficiency.",
      "Tech Agenz helps SaaS founders build scalable MVPs that can seamlessly support ten thousand concurrent enterprise accounts without requiring an expensive architectural rewrite.",
    ],
  },
  {
    id: "software-house-cybersecurity-best-practices",
    title: "Cybersecurity Best Practices for Business Applications: Protecting Critical Data in 2026",
    category: "Enterprise ERP",
    readTime: "6 min read",
    date: "Aug 26, 2026",
    author: "Tech Agenz Security Team",
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80",
    keywords: [
      "Software House Cybersecurity",
      "Data Privacy & Encryption",
      "Secure API Development",
      "SOC2 & GDPR Compliance",
      "Enterprise Security",
    ],
    excerpt:
      "Defense-in-depth principles for custom applications: role-based access control (RBAC), end-to-end payload encryption, JWT rotation, and audit logs to prevent data breaches.",
    keyTakeaways: [
      "80% of application vulnerabilities stem from broken object-level authorization (BOLA) and insecure API endpoints.",
      "Strict role-based access control (RBAC) and immutable audit logs ensure internal compliance and forensic accountability.",
      "End-to-end encryption in transit (TLS 1.3) and at rest (AES-256) is non-negotiable for enterprise business software.",
    ],
    content: [
      "As businesses digitalize their core operations, their web portals and internal databases become high-value targets for malicious actors. A single vulnerability in an API endpoint can expose confidential patient health data, customer financials, or intellectual property.",
      "At Tech Agenz, security is embedded into every sprint cycle. We implement defense-in-depth security architectures: automated rate limiting, input sanitization against SQL injection, cryptographic password hashing with Argon2, and strict JWT rotation.",
      "By adopting secure-by-design standards from day one, we protect our clients' reputations and ensure seamless compliance with international data privacy regulations.",
    ],
  },
];

const categories = [
  "All",
  "AI & ML",
  "Custom Software",
  "Automation",
  "Enterprise ERP",
  "Industry Solutions",
];

function BlogsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesCategory =
        activeCategory === "All" || post.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.category.toLowerCase().includes(q) ||
        post.keywords.some((k) => k.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    return blogPosts.find((p) => p.featured) || blogPosts[0];
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim()) {
      setSubscribed(true);
      setEmailInput("");
    }
  };

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
            maskImage:
              "radial-gradient(ellipse 70% 60% at 50% 40%, black 30%, transparent 80%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-4 py-1.5 text-xs uppercase tracking-widest text-brand"
          >
            <BookOpen className="h-3.5 w-3.5" /> Tech Agenz Engineering & Insights
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-hero mt-5 text-3xl font-bold uppercase sm:text-5xl lg:text-6xl"
          >
            Software Architecture & <br />
            <span className="text-gradient-brand">AI Engineering Field Notes</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display mx-auto mt-5 max-w-2xl text-sm text-muted-foreground sm:text-base leading-relaxed"
          >
            Authoritative technical guides, architectural blueprints, and production field notes
            on building modern software, AI automation pipelines, and ERPNext platforms.
          </motion.p>
        </div>
      </section>

      {/* Search & Category Filter */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
            {/* Categories */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {categories.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`rounded-full px-4 py-2 text-xs font-medium transition-colors sm:text-sm ${
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

            {/* Search Input */}
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles & keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-border/80 bg-card/60 py-2 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground outline-none ring-0 focus:border-brand sm:text-sm"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing <strong className="text-foreground">{filteredPosts.length}</strong>{" "}
              {filteredPosts.length === 1 ? "article" : "articles"}
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-brand hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Featured Blog Banner (displayed when viewing All and no search) */}
      {activeCategory === "All" && !searchQuery && featuredPost && (
        <section className="relative pb-12">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-card relative overflow-hidden rounded-3xl border border-brand/30 shadow-2xl"
            >
              <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-center">
                {/* Featured Image */}
                <div className="relative h-64 sm:h-80 lg:h-full w-full overflow-hidden">
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    width={1200}
                    height={800}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-background/10 lg:to-background" />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="rounded-full bg-brand/90 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-md backdrop-blur-md">
                      ★ Featured Insight
                    </span>
                  </div>
                </div>

                {/* Featured Content */}
                <div className="p-6 sm:p-10 lg:p-12">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full bg-brand/10 px-3 py-1 font-medium text-brand">
                      {featuredPost.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {featuredPost.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {featuredPost.readTime}
                    </span>
                  </div>

                  <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl lg:text-4xl leading-tight">
                    {featuredPost.title}
                  </h2>

                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {featuredPost.excerpt}
                  </p>

                  {/* Keywords */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {featuredPost.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="rounded-full border border-border/70 bg-card/60 px-2.5 py-0.5 text-[11px] text-muted-foreground"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => setSelectedPost(featuredPost)}
                      className="glow-brand inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs sm:text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
                    >
                      Read full article <ArrowUpRight className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-muted-foreground">
                      By {featuredPost.author}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Blog Cards Grid */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, idx) => (
                <motion.article
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.04 }}
                  className="glass-card group flex flex-col justify-between overflow-hidden rounded-3xl border border-border/70 transition-transform duration-300 hover:border-brand/50 hover:-translate-y-1 shadow-lg"
                >
                  <div>
                    {/* Picture Banner with Category Badge */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                      <img
                        src={post.image}
                        alt={post.title}
                        width={800}
                        height={500}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
                        <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-cyan-300 shadow-md backdrop-blur-md border border-cyan-500/20">
                          {post.category}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3 z-10">
                        <span className="flex items-center gap-1 rounded-full bg-slate-950/70 px-2.5 py-0.5 text-[11px] text-slate-300 backdrop-blur-sm">
                          <Clock className="h-3 w-3 text-brand" /> {post.readTime}
                        </span>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {post.date}
                        </span>
                        <span className="text-[11px]">{post.author.split(",")[0]}</span>
                      </div>

                      <h3 className="mt-3 font-display text-lg font-bold leading-snug transition-colors group-hover:text-brand line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-3">
                        {post.excerpt}
                      </p>

                      {/* Keywords Badges */}
                      <div className="mt-4 flex flex-wrap gap-1">
                        {post.keywords.slice(0, 3).map((kw) => (
                          <span
                            key={kw}
                            className="rounded-full bg-brand/5 border border-brand/15 px-2 py-0.5 text-[10px] text-brand/80"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="border-t border-border/60 p-6 pt-4">
                    <button
                      onClick={() => setSelectedPost(post)}
                      className="inline-flex w-full items-center justify-between rounded-full border border-brand/30 bg-brand/5 px-4 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-primary-foreground"
                    >
                      <span>Read article</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {filteredPosts.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">
                No articles match &ldquo;{searchQuery}&rdquo; in {activeCategory}.
              </p>
              <button
                onClick={() => {
                  setActiveCategory("All");
                  setSearchQuery("");
                }}
                className="mt-4 text-xs font-medium text-brand hover:underline"
              >
                Reset all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Article Detail Modal / Reader */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-background/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-brand/40 p-6 sm:p-10 shadow-2xl"
            >
              {/* Header Picture */}
              <div className="relative -mx-6 -mt-6 sm:-mx-10 sm:-mt-10 mb-6 aspect-[16/8] overflow-hidden rounded-t-3xl bg-slate-950">
                <img
                  src={selectedPost.image}
                  alt={selectedPost.title}
                  width={1200}
                  height={600}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent" />
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-4 right-4 z-20 rounded-full border border-white/20 bg-black/60 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md hover:bg-black/90 transition-colors"
                >
                  ✕ Close
                </button>
                <div className="absolute bottom-4 left-6 sm:left-10 z-10">
                  <span className="rounded-full bg-brand/90 px-3.5 py-1 text-xs font-semibold text-primary-foreground shadow-md backdrop-blur-md">
                    {selectedPost.category}
                  </span>
                </div>
              </div>

              {/* Title & Metadata */}
              <h2 className="font-display text-2xl font-bold sm:text-3xl leading-tight">
                {selectedPost.title}
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground border-b border-border/60 pb-4">
                <span>By <strong className="text-foreground">{selectedPost.author}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" /> {selectedPost.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {selectedPost.readTime}
                </span>
              </div>

              {/* Key Takeaways Box */}
              {selectedPost.keyTakeaways && selectedPost.keyTakeaways.length > 0 && (
                <div className="my-6 rounded-2xl border border-brand/30 bg-brand/5 p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
                    <Sparkles className="h-3.5 w-3.5" /> Key Architectural Takeaways
                  </div>
                  <ul className="mt-3 space-y-2 text-xs sm:text-sm text-foreground/90">
                    {selectedPost.keyTakeaways.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 shrink-0 text-brand mt-0.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Main Content Paragraphs */}
              <div className="space-y-4 text-sm leading-relaxed text-foreground/90">
                <p className="text-base font-medium text-foreground leading-relaxed">
                  {selectedPost.excerpt}
                </p>
                {selectedPost.content.map((paragraph, idx) => (
                  <p key={idx} className="text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Keyword Tags */}
              <div className="mt-6 pt-4 border-t border-border/60">
                <div className="text-xs font-medium text-muted-foreground mb-2">Related Topics:</div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPost.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-card border border-border/80 px-2.5 py-1 text-xs text-muted-foreground"
                    >
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Bottom Project CTA */}
              <div className="mt-8 rounded-2xl border border-border/80 bg-card/80 p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="font-display text-base font-semibold text-foreground">
                      Ready to build your next software project?
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Partner with Tech Agenz for AI automation, custom software, and enterprise ERPNext systems.
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="https://wa.me/923394555004"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> WhatsApp
                    </a>
                    <Link
                      to="/contact"
                      className="glow-brand inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-medium text-primary-foreground hover:scale-105 transition-transform"
                    >
                      Contact Us <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Newsletter Signup */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center border border-brand/20">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1 text-xs uppercase tracking-widest text-brand">
              <Sparkles className="h-3.5 w-3.5" /> Stay Ahead of the Curve
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
              Subscribe to Tech Agenz Engineering Insights
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-xs text-muted-foreground sm:text-sm">
              Periodic field notes on artificial intelligence, autonomous agentic systems, and high-performance software architecture. No spam.
            </p>

            {subscribed ? (
              <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-xs text-emerald-400">
                <CheckCircle className="h-4 w-4" /> Thank you for subscribing! We&apos;ll keep you posted.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  required
                  placeholder="Enter your work email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full rounded-full border border-border/80 bg-background/80 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none ring-0 focus:border-brand sm:text-sm"
                />
                <button
                  type="submit"
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-brand px-6 py-2.5 text-xs font-medium text-primary-foreground transition-transform hover:scale-105 sm:text-sm"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default BlogsPage;
