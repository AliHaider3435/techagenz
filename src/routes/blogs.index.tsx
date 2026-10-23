import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, ArrowUpRight, Search, Sparkles, Tag, CheckCircle } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { TechCursor } from "@/components/TechCursor";
import { blogPosts, blogCategories } from "@/lib/blogs-data";

export const Route = createFileRoute("/blogs/")({
  head: () => ({
    meta: [
      {
        title: "Tech Agenz Blog — AI Engineering & Custom Software Development in Pakistan",
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
      { property: "og:url", content: "https://techagenz.com/blogs" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://techagenz.com/og-image.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "twitter:title",
        content: "Tech Agenz Blog — Software Engineering & AI Automation Insights",
      },
      {
        name: "twitter:description",
        content:
          "Practical blueprints, architectural deep dives, and production case studies for businesses scaling with modern AI, custom software, and ERPNext.",
      },
      { name: "twitter:image", content: "https://techagenz.com/og-image.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://techagenz.com/blogs" }],
  }),
  component: BlogsIndexPage,
});

function BlogsIndexPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const matchesCategory = activeCategory === "All" || post.category === activeCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        post.title.toLowerCase().includes(q) ||
        post.excerpt.toLowerCase().includes(q) ||
        post.keywords.some((k) => k.toLowerCase().includes(q)) ||
        post.category.toLowerCase().includes(q);

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
            <Sparkles className="h-3.5 w-3.5" /> Insights & Blueprints
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
            Authoritative technical guides, architectural blueprints, and production field notes on
            building modern software, AI automation pipelines, and ERPNext platforms.
          </motion.p>
        </div>
      </section>

      {/* Search & Category Filter */}
      <section className="relative pb-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col items-center justify-between gap-5 md:flex-row">
            {/* Categories */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {blogCategories.map((cat) => {
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
              <button onClick={() => setSearchQuery("")} className="text-brand hover:underline">
                Clear search
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Featured Blog Banner */}
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
                <div className="relative h-64 sm:h-80 lg:h-full w-full overflow-hidden bg-slate-950">
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
                    <Link
                      to="/blogs/$slug"
                      params={{ slug: featuredPost.id }}
                      className="hover:text-brand transition-colors"
                    >
                      {featuredPost.title}
                    </Link>
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
                    <Link
                      to="/blogs/$slug"
                      params={{ slug: featuredPost.id }}
                      className="glow-brand inline-flex items-center gap-2 rounded-full bg-brand px-6 py-2.5 text-xs sm:text-sm font-medium text-primary-foreground transition-transform hover:scale-105"
                    >
                      Read full article <ArrowUpRight className="h-4 w-4" />
                    </Link>
                    <span className="text-xs text-muted-foreground">By {featuredPost.author}</span>
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
                    <Link
                      to="/blogs/$slug"
                      params={{ slug: post.id }}
                      className="block relative aspect-[16/10] w-full overflow-hidden bg-slate-950"
                    >
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
                    </Link>

                    {/* Card Content */}
                    <div className="p-6">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {post.date}
                        </span>
                        <span className="text-[11px]">{post.author.split(",")[0]}</span>
                      </div>

                      <h3 className="mt-3 font-display text-lg font-bold leading-snug transition-colors group-hover:text-brand line-clamp-2">
                        <Link
                          to="/blogs/$slug"
                          params={{ slug: post.id }}
                          className="hover:text-brand transition-colors"
                        >
                          {post.title}
                        </Link>
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

                  {/* Card Footer with real Link */}
                  <div className="border-t border-border/60 p-6 pt-4">
                    <Link
                      to="/blogs/$slug"
                      params={{ slug: post.id }}
                      className="inline-flex w-full items-center justify-between rounded-full border border-brand/30 bg-brand/5 px-4 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand hover:text-primary-foreground"
                    >
                      <span>Read article</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
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
              Periodic field notes on artificial intelligence, autonomous agentic systems, and
              high-performance software architecture. No spam.
            </p>

            {subscribed ? (
              <div className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-5 py-2.5 text-xs text-emerald-400">
                <CheckCircle className="h-4 w-4" /> Thank you for subscribing! We&apos;ll keep you
                posted.
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="mx-auto mt-6 flex max-w-md flex-col gap-2 sm:flex-row"
              >
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

export default BlogsIndexPage;
