import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowUpRight,
  Sparkles,
  CheckCircle,
  MessageSquare,
  Share2,
  Copy,
  Check,
  Tag,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { TechCursor } from "@/components/TechCursor";
import { getBlogPost, getRelatedBlogPosts } from "@/lib/blogs-data";

export const Route = createFileRoute("/blogs/$slug")({
  loader: async ({ params }) => {
    let post = getBlogPost(params.slug);
    if (!post && typeof window !== "undefined") {
      try {
        const res = await fetch("/api/cms");
        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data?.blogs)) {
            post = json.data.blogs.find((b: { id: string }) => b.id === params.slug);
          }
        }
      } catch {}
    }
    if (!post) {
      throw notFound();
    }
    return { post };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) {
      return {
        meta: [{ title: "Blog Post Not Found — Tech Agenz" }],
      };
    }

    const postUrl = `https://techagenz.com/blogs/${post.id}`;
    const imageUrl = `https://techagenz.com${post.image}`;

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt,
      image: [imageUrl],
      datePublished: post.publishDateIso,
      dateModified: post.publishDateIso,
      author: {
        "@type": "Person",
        name: post.author,
      },
      publisher: {
        "@type": "Organization",
        name: "Tech Agenz",
        url: "https://techagenz.com",
        logo: {
          "@type": "ImageObject",
          url: "https://techagenz.com/assets/logo.webp",
        },
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": postUrl,
      },
      keywords: post.keywords.join(", "),
      articleSection: post.category,
    };

    const breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://techagenz.com/",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blogs",
          item: "https://techagenz.com/blogs",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: postUrl,
        },
      ],
    };

    return {
      meta: [
        { title: `${post.title} — Tech Agenz` },
        { name: "description", content: post.excerpt },
        { name: "keywords", content: post.keywords.join(", ") },
        { name: "author", content: post.author },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt },
        { property: "og:url", content: postUrl },
        { property: "og:type", content: "article" },
        { property: "og:image", content: imageUrl },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.excerpt },
        { name: "twitter:image", content: imageUrl },
      ],
      links: [{ rel: "canonical", href: postUrl }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify(articleSchema),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify(breadcrumbSchema),
        },
      ],
    };
  },
  component: BlogPostDetail,
});

function BlogPostDetail() {
  const { post } = Route.useLoaderData();
  const relatedPosts = getRelatedBlogPosts(post.id, 3);
  const [copied, setCopied] = useState(false);

  const postUrl =
    typeof window !== "undefined" ? window.location.href : `https://techagenz.com/blogs/${post.id}`;

  const copyToClipboard = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground">
      <TechCursor />
      <WhatsAppButton />
      <Nav />

      {/* Hero Header & Breadcrumbs */}
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

        <div className="relative mx-auto max-w-4xl px-6">
          {/* Breadcrumbs Navigation */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
          >
            <Link to="/" className="hover:text-brand transition-colors">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/blogs" className="hover:text-brand transition-colors">
              Blogs
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground/80 line-clamp-1">{post.title}</span>
          </nav>

          <Link
            to="/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:underline mb-4"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to all articles
          </Link>

          {/* Category & Metadata */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="rounded-full bg-brand/10 border border-brand/20 px-3 py-1 font-semibold text-brand">
              {post.category}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {post.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {post.readTime}
            </span>
          </div>

          {/* Main H1 Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-hero mt-6 text-3xl font-bold uppercase leading-tight sm:text-4xl lg:text-5xl"
          >
            {post.title}
          </motion.h1>

          <p className="mt-4 text-sm sm:text-base text-muted-foreground leading-relaxed font-display">
            By <strong className="text-foreground font-semibold">{post.author}</strong> —
            Engineering insights from Tech Agenz.
          </p>

          {/* Social Share Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-3 border-y border-border/60 py-3">
            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
              <Share2 className="h-3.5 w-3.5 text-brand" /> Share article:
            </span>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`${post.title} - https://techagenz.com/blogs/${post.id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              WhatsApp
            </a>
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://techagenz.com/blogs/${post.id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs text-sky-400 hover:bg-sky-500/20 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://techagenz.com/blogs/${post.id}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card/60 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              X / Twitter
            </a>
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-card/60 px-3 py-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {copied ? (
                <Check className="h-3 w-3 text-emerald-400" />
              ) : (
                <Copy className="h-3 w-3" />
              )}
              {copied ? "Copied Link!" : "Copy Link"}
            </button>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="relative pb-12">
        <div className="mx-auto max-w-4xl px-6">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-border/70 shadow-2xl bg-slate-950">
            <img
              src={post.image}
              alt={post.title}
              width={1200}
              height={675}
              fetchPriority="high"
              onError={(e) => {
                e.currentTarget.src = "/blog-images/ai-software-house-pakistan.webp";
              }}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="relative pb-20">
        <div className="mx-auto max-w-4xl px-6">
          {/* Key Architectural Takeaways Box */}
          {post.keyTakeaways && post.keyTakeaways.length > 0 && (
            <div className="mb-10 rounded-3xl border border-brand/30 bg-brand/5 p-6 sm:p-8 backdrop-blur-md">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
                <Sparkles className="h-4 w-4" /> Key Architectural Takeaways
              </div>
              <ul className="mt-4 space-y-3 text-sm sm:text-base text-foreground/90 leading-relaxed">
                {post.keyTakeaways.map((point, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 shrink-0 text-brand mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lead Paragraph */}
          <div className="glass-card mb-8 rounded-2xl border border-border/70 p-6 text-base sm:text-lg font-medium leading-relaxed text-foreground">
            {post.excerpt}
          </div>

          {/* Body Paragraphs with Headings Support */}
          <div className="space-y-6 text-base leading-relaxed text-muted-foreground font-normal">
            {post.content.map((paragraph, idx) => {
              if (paragraph.startsWith("## ")) {
                return (
                  <h2 key={idx} className="font-display text-2xl sm:text-3xl font-bold text-foreground pt-4 pb-1 text-slate-100">
                    {paragraph.replace(/^##\s+/, "")}
                  </h2>
                );
              }
              if (paragraph.startsWith("### ")) {
                return (
                  <h3 key={idx} className="font-display text-lg sm:text-xl font-semibold text-foreground pt-2 text-cyan-300">
                    {paragraph.replace(/^###\s+/, "")}
                  </h3>
                );
              }
              if (paragraph.startsWith("- ")) {
                return (
                  <li key={idx} className="ml-5 list-disc text-foreground/90 pl-1 leading-relaxed">
                    {paragraph.replace(/^-\s+/, "")}
                  </li>
                );
              }
              return (
                <p key={idx} className="leading-relaxed text-foreground/90 text-sm sm:text-base">
                  {paragraph}
                </p>
              );
            })}
          </div>

          {/* Internal Linking Relevant Service Card */}
          <div className="my-12 rounded-3xl border border-brand/30 bg-gradient-to-br from-card/80 to-brand/10 p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-brand">
                  Recommended Engineering Solution
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-foreground mt-1">
                  Ready to deploy this architecture in your company?
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                  Tech Agenz specializes in custom software development in Pakistan, WhatsApp
                  automation, and ERPNext integrations for growing enterprises.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
                <a
                  href="https://wa.me/923394555004"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-5 py-2.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                >
                  <MessageSquare className="h-4 w-4" /> Chat on WhatsApp
                </a>
                <Link
                  to="/services"
                  className="glow-brand inline-flex items-center justify-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-medium text-primary-foreground hover:scale-105 transition-transform"
                >
                  Explore Services <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Topics / Keywords */}
          <div className="border-t border-border/70 pt-6">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
              <Tag className="h-3.5 w-3.5 text-brand" /> Related Topics & Keywords:
            </div>
            <div className="flex flex-wrap gap-2">
              {post.keywords.map((kw) => (
                <span
                  key={kw}
                  className="rounded-full border border-border/80 bg-card/60 px-3 py-1 text-xs text-muted-foreground hover:text-brand transition-colors"
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles Section */}
      {relatedPosts.length > 0 && (
        <section className="relative border-t border-border/60 py-20 bg-card/20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-xs uppercase tracking-widest text-brand font-semibold">
                  Continue Reading
                </span>
                <h2 className="font-display text-2xl font-bold sm:text-3xl text-foreground mt-1">
                  Related Engineering Articles
                </h2>
              </div>
              <Link
                to="/blogs"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
              >
                View all articles <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((item) => (
                <Link
                  key={item.id}
                  to="/blogs/$slug"
                  params={{ slug: item.id }}
                  className="glass-card group flex flex-col justify-between overflow-hidden rounded-3xl border border-border/70 hover:border-brand/50 transition-transform duration-300 hover:-translate-y-1 shadow-lg"
                >
                  <div>
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                      <img
                        src={item.image}
                        alt={item.title}
                        width={600}
                        height={375}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="rounded-full bg-slate-950/80 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300 backdrop-blur-md border border-cyan-500/20">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Calendar className="h-3 w-3" /> {item.date} • {item.readTime}
                      </div>
                      <h3 className="mt-2 font-display text-base font-bold leading-snug transition-colors group-hover:text-brand line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {item.excerpt}
                      </p>
                    </div>
                  </div>
                  <div className="p-5 pt-0">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand group-hover:underline">
                      Read article <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Box */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="glass-card rounded-3xl p-8 sm:p-12 text-center border border-brand/30">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              Have an AI or Software Project in Mind?
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-xs sm:text-sm text-muted-foreground">
              Speak with our senior engineers about custom software, clinic booking systems, legal
              tech, or WhatsApp automation.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                className="glow-brand inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-xs sm:text-sm font-medium text-primary-foreground hover:scale-105 transition-transform"
              >
                Schedule Free Consultation <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href="https://wa.me/923394555004"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-6 py-3 text-xs sm:text-sm font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors"
              >
                WhatsApp Directly
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default BlogPostDetail;
