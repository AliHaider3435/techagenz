import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowUpRight,
  Search,
  Sparkles,
  Tag,
  Share2,
  CheckCircle,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import BouncyButton from "@/components/BouncyButton";
import WhatsAppButton from "@/components/WhatsAppButton";
import { TechCursor } from "@/components/TechCursor";

export const Route = createFileRoute("/blogs")({
  head: () => ({
    meta: [
      { title: "Blogs & Insights — Tech Agenz" },
      {
        name: "description",
        content:
          "Articles, technical deep-dives, and production case studies on AI engineering, autonomous workflows, and modern web architectures by Tech Agenz.",
      },
    ],
  }),
  component: BlogsPage,
});

const blogPosts = [
  {
    id: "production-rag-2026",
    title: "Architecting Production RAG: Eliminating Hallucinations at Enterprise Scale",
    category: "AI & ML",
    readTime: "6 min read",
    date: "Oct 12, 2026",
    author: "Tech Agenz Engineering",
    excerpt:
      "A deep dive into hybrid search, reciprocal rank fusion, dynamic semantic chunking, and cross-encoder re-ranking to achieve sub-second, 99%+ factual accuracy.",
    content: [
      "Naive RAG setups fail when enterprise knowledge bases grow past thousands of unstructured documents. The primary culprit is vector collision and irrelevant semantic matches.",
      "By integrating dense vector search with BM25 sparse keyword retrieval and applying a cross-encoder re-ranker (such as BGE-Reranker-Large), retrieval accuracy improves dramatically.",
      "Furthermore, caching repeated query embeddings in Redis alongside prompt guardrails cuts LLM API costs by up to 60% while reducing p95 response latencies to under 350ms.",
    ],
    featured: true,
  },
  {
    id: "healthcare-scheduling-automation",
    title: "Digitizing Healthcare Scheduling: Lessons from High-Throughput Clinic Systems",
    category: "Case Studies",
    readTime: "5 min read",
    date: "Oct 08, 2026",
    author: "Ali Haider",
    excerpt:
      "How real-time slot reservation, doctor queue management, and automated WhatsApp notifications eliminated patient no-shows for leading medical practices.",
    content: [
      "Clinical queue congestion and uncoordinated walk-ins severely burden healthcare providers. In our work for Dr. Iqbal Ahmad Kharal and Dr. Sajid Sohail, we architected appointment systems centered on patient convenience and doctor workflow control.",
      "Key engineering requirements included atomic slot locking to prevent double bookings, multi-channel automated reminders via WhatsApp and SMS, and an intuitive doctor dashboard.",
      "The result was a 42% reduction in clinic wait times and virtually zero missed appointment slots across both practices.",
    ],
    featured: false,
  },
  {
    id: "autonomous-agentic-workflows",
    title: "From Brittle Scripts to Self-Healing Autonomous Agentic Workflows",
    category: "Automation",
    readTime: "7 min read",
    date: "Sep 28, 2026",
    author: "Tech Agenz Team",
    excerpt:
      "Why traditional cron jobs break down and how stateful, event-driven multi-agent pipelines deliver fault-tolerant enterprise operations.",
    content: [
      "Standard webhook listeners and single-threaded cron jobs lack the statefulness required for complex multi-step operations. When third-party APIs experience downtime, data often gets lost.",
      "Using Temporal and LangGraph, we design stateful agent orchestrations where each step is checkpointed. If a step fails, the system executes deterministic exponential backoff retries without restarting the whole flow.",
      "This architecture enables autonomous customer intake, document validation, and ERP sync with zero manual human intervention required.",
    ],
    featured: false,
  },
  {
    id: "legal-tech-practice-portals",
    title: "Legal Tech Evolution: Engineering Secure Consultation Portals for Law Chambers",
    category: "Case Studies",
    readTime: "4 min read",
    date: "Sep 15, 2026",
    author: "Ali Haider",
    excerpt:
      "A case breakdown of Garwan Law Chamber's digital intake portal, confidential document exchange, and attorney booking infrastructure.",
    content: [
      "Legal practices require exceptional credibility, stringent confidentiality, and frictionless onboarding for prospective clients.",
      "For Garwan Law Chamber, we engineered a digital portal emphasizing verified attorney profiles, practice area directories, and confidential case intake workflows.",
      "The platform establishes immediate trust, streamlines scheduling between clients and senior advocates, and dramatically elevates the chamber's digital authority.",
    ],
    featured: false,
  },
  {
    id: "sub-second-web-vitals",
    title: "Sub-Second Web Vitals: Building with React 19, TanStack Start & Tailwind",
    category: "Architecture",
    readTime: "5 min read",
    date: "Aug 29, 2026",
    author: "Tech Agenz Engineering",
    excerpt:
      "Practical frontend performance optimizations: converting legacy media to WebP, eliminating render-blocking styles, and reaching 95+ Lighthouse mobile scores.",
    content: [
      "User attention drops significantly for every 100ms delay in first contentful paint. Modern web development must balance rich interactive visuals with featherweight performance.",
      "By replacing raw PNGs with compressed WebP assets, lazy loading heavy 3D scenes after first paint, and adopting server-side rendered TanStack routes, we shaved megabytes from initial bundles.",
      "The payoff is instant navigation, improved SEO crawling by Google Search Console, and superior user retention rates.",
    ],
    featured: false,
  },
  {
    id: "mlops-low-latency-inference",
    title: "The MLOps Playbook: Cutting Inference Costs and Latencies in Half",
    category: "AI & ML",
    readTime: "8 min read",
    date: "Aug 14, 2026",
    author: "Tech Agenz Team",
    excerpt:
      "Architectural patterns for hosting open-source LLMs on cloud GPUs: quantization (AWQ/GPTQ), continuous batching, and semantic response caching.",
    content: [
      "Relying solely on commercial closed-source APIs can become prohibitively expensive at scale while creating vendor lock-in and data privacy risks.",
      "Deploying self-hosted open models like Llama 3 or DeepSeek with vLLM using AWQ 4-bit quantization yields high throughput at a fraction of cloud inference budgets.",
      "Combined with semantic response caching and speculative decoding, engineering teams can deliver rapid sub-200ms user experiences.",
    ],
    featured: false,
  },
];

const categories = ["All", "AI & ML", "Automation", "Case Studies", "Architecture"];

function BlogsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<(typeof blogPosts)[number] | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredPost = blogPosts.find((p) => p.featured) || blogPosts[0];

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
      <section className="relative pt-36 pb-14">
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
            <BookOpen className="h-3.5 w-3.5" /> Tech Agenz Blogs & Insights
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-hero mt-5 text-4xl font-bold uppercase sm:text-6xl"
          >
            Ideas, Architectures & <br />
            <span className="text-gradient-brand">Production Field Notes</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            Explore technical deep-dives, architectural blueprints, and real-world implementation stories from our engineering team.
          </motion.p>
        </div>
      </section>

      {/* Search & Category Filter */}
      <section className="relative pb-10">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
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
                        ? "bg-brand text-primary-foreground glow-brand"
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
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-border/80 bg-card/60 py-2 pl-10 pr-4 text-xs text-foreground placeholder:text-muted-foreground outline-none ring-0 focus:border-brand sm:text-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Blog Banner (if viewing All and no search) */}
      {activeCategory === "All" && !searchQuery && (
        <section className="relative pb-14">
          <div className="mx-auto max-w-7xl px-6">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-card relative overflow-hidden rounded-3xl border border-brand/30 p-8 sm:p-12"
            >
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="rounded-full bg-brand/20 px-3 py-1 font-medium text-brand">
                  ★ Featured Insight
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> {featuredPost.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" /> {featuredPost.readTime}
                </span>
              </div>

              <h2 className="mt-4 font-display text-2xl font-bold sm:text-4xl">
                {featuredPost.title}
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {featuredPost.excerpt}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => setSelectedPost(featuredPost)}
                  className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
                >
                  Read full article <ArrowUpRight className="h-4 w-4" />
                </button>
                <span className="text-xs text-muted-foreground">By {featuredPost.author}</span>
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
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                  className="glass-card group flex flex-col justify-between rounded-3xl p-6 transition-transform duration-300 hover:border-brand/40 hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {post.readTime}
                      </span>
                    </div>

                    <h3 className="mt-4 font-display text-lg font-bold transition-colors group-hover:text-brand">
                      {post.title}
                    </h3>

                    <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-border/60 pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                      <button
                        onClick={() => setSelectedPost(post)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand transition-colors hover:underline"
                      >
                        Read article <ArrowUpRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {filteredPosts.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">No articles match your search criteria.</p>
              <button
                onClick={() => {
                  setActiveCategory("All");
                  setSearchQuery("");
                }}
                className="mt-4 text-xs font-medium text-brand hover:underline"
              >
                Reset filters
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
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-brand/40 p-6 sm:p-10 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                  {selectedPost.category}
                </span>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground hover:bg-card hover:text-foreground"
                >
                  ✕ Close
                </button>
              </div>

              <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
                {selectedPost.title}
              </h2>

              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <span>By {selectedPost.author}</span>
                <span>•</span>
                <span>{selectedPost.date}</span>
                <span>•</span>
                <span>{selectedPost.readTime}</span>
              </div>

              <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/90">
                <p className="text-base font-medium text-foreground">{selectedPost.excerpt}</p>
                {selectedPost.content.map((paragraph, idx) => (
                  <p key={idx} className="text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="mt-8 border-t border-border/60 pt-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-muted-foreground">
                    Want to discuss applying this architecture to your business?
                  </div>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-xs font-medium text-primary-foreground transition-transform hover:scale-105"
                  >
                    Start a conversation <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Newsletter Signup */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs uppercase tracking-widest text-brand">
              <Sparkles className="h-3 w-3" /> Stay Ahead of the Curve
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
              Subscribe to Tech Agenz Engineering Insights
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-xs text-muted-foreground sm:text-sm">
              No spam. Just periodic field notes on artificial intelligence, autonomous systems, and high-performance software architecture.
            </p>

            {subscribed ? (
              <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-xs text-emerald-400">
                <CheckCircle className="h-4 w-4" /> Thank you for subscribing! We'll keep you posted.
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
