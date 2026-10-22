import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  ArrowUpRight,
  Sparkles,
  MessageSquare,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Linkedin,
  Github,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { TechCursor } from "@/components/TechCursor";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Tech Agenz | AI-Powered Software House in Pakistan" },
      {
        name: "description",
        content:
          "Contact Tech Agenz to discuss your business challenges and discover the right technology solution: AI automation, custom software, WhatsApp automation, and ERPNext.",
      },
      { property: "og:title", content: "Contact Us — Tech Agenz | AI-Powered Software House in Pakistan" },
      {
        property: "og:description",
        content:
          "Contact Tech Agenz to discuss your business challenges and discover the right technology solution: AI automation, custom software, WhatsApp automation, and ERPNext.",
      },
      { property: "og:url", content: "https://www.techagenz.com/contact" },
    ],
    links: [
      { rel: "canonical", href: "https://www.techagenz.com/contact" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    let success = false;

    // 1. Primary server endpoint
    try {
      const res = await fetch("/api/send-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        success = true;
      }
    } catch {
      // Endpoint unreachable, continue to fallback
    }

    // 2. Direct client fallback: FormSubmit directly to info@techagenz.com
    if (!success) {
      try {
        const fallbackRes = await fetch("https://formsubmit.co/ajax/info@techagenz.com", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            company: formData.company || "Not specified",
            message: formData.message,
            _subject: `New Enquiry from ${formData.name}`,
            _replyto: formData.email,
          }),
        });

        if (fallbackRes.ok) {
          success = true;
        }
      } catch {
        // Fallback failed
      }
    }

    if (success) {
      setStatus("sent");
      setFormData({ name: "", email: "", company: "", message: "" });
    } else {
      setStatus("error");
      setErrorMessage("Something went wrong — please try again or email info@techagenz.com directly.");
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
            <Sparkles className="h-3.5 w-3.5" /> Start a Conversation
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-hero mt-5 text-4xl font-bold uppercase sm:text-6xl"
          >
            Transform Your Business with <br />
            <span className="text-gradient-brand">Smarter Technology</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-display mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg"
          >
            Ready to improve your workflows, simplify customer communication, or modernize your business systems? Contact Tech Agenz to discuss your business challenges and discover the right technology solution for your next stage of growth.
          </motion.p>
        </div>
      </section>

      {/* Contact Grid: Details + Form */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="glass-card relative overflow-hidden rounded-3xl p-8 sm:p-14">
            <div className="absolute -top-24 left-1/2 h-64 w-[700px] -translate-x-1/2 rounded-full bg-brand/30 blur-3xl pointer-events-none" />

            <div className="relative grid items-start gap-12 lg:grid-cols-[1fr_1.2fr]">
              {/* Left Column: Direct Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="font-display text-2xl font-bold sm:text-3xl">
                    Get in touch directly
                  </h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Whether you have an immediate RFP, an architecture query, or want an expert evaluation, our lead engineers are here to assist.
                  </p>
                </div>

                <div className="space-y-4">
                  <a
                    href="mailto:info@techagenz.com"
                    className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:border-brand/50 hover:bg-card"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Direct Email</div>
                      <div className="font-medium text-foreground">info@techagenz.com</div>
                    </div>
                  </a>

                  <a
                    href="https://wa.me/923394555004"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card/60 p-4 transition-colors hover:border-brand/50 hover:bg-card"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">WhatsApp & Phone</div>
                      <div className="font-medium text-foreground">03394555004</div>
                    </div>
                  </a>
                </div>

                <div className="border-t border-border/60 pt-6">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">
                    Connect on Socials
                  </div>
                  <div className="mt-4 flex gap-3">
                    <a
                      href="https://www.linkedin.com/in/haider5617/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-brand/10 hover:text-brand"
                      aria-label="LinkedIn"
                    >
                      <Linkedin className="h-5 w-5 text-muted-foreground transition-colors hover:text-brand" />
                    </a>
                    <a
                      href="https://github.com/AliHaider3435"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-card flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-brand/10 hover:text-brand"
                      aria-label="GitHub"
                    >
                      <Github className="h-5 w-5 text-muted-foreground transition-colors hover:text-brand" />
                    </a>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/50 p-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand">
                    <Clock className="h-4 w-4" /> Response Guarantee
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                    We review all messages within 24 hours. Your information and project details are kept strictly confidential under NDA standards.
                  </p>
                </div>
              </div>

              {/* Right Column: Contact Form */}
              <div>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 rounded-3xl border border-border/60 bg-background/60 p-6 sm:p-8"
                >
                  <h3 className="font-display text-xl font-semibold">Send an enquiry</h3>
                  <p className="text-xs text-muted-foreground">
                    Fill in your project details below and we'll reply directly to your email inbox.
                  </p>


                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="text-sm text-muted-foreground">
                      <span className="mb-1 block font-medium">Your Name *</span>
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-border/60 bg-card/70 px-3.5 py-2.5 text-sm text-foreground outline-none ring-0 focus:border-brand"
                        placeholder="e.g. Alex Johnson"
                      />
                    </label>

                    <label className="text-sm text-muted-foreground">
                      <span className="mb-1 block font-medium">Your Email *</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-xl border border-border/60 bg-card/70 px-3.5 py-2.5 text-sm text-foreground outline-none ring-0 focus:border-brand"
                        placeholder="you@company.com"
                      />
                    </label>
                  </div>

                  <label className="block text-sm text-muted-foreground">
                    <span className="mb-1 block font-medium">Company or Organization</span>
                    <input
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-border/60 bg-card/70 px-3.5 py-2.5 text-sm text-foreground outline-none ring-0 focus:border-brand"
                      placeholder="e.g. Acme Corp"
                    />
                  </label>

                  <label className="block text-sm text-muted-foreground">
                    <span className="mb-1 block font-medium">Project details & goals *</span>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full rounded-xl border border-border/60 bg-card/70 px-3.5 py-2.5 text-sm text-foreground outline-none ring-0 focus:border-brand"
                      placeholder="Briefly describe what you're looking to engineer, target timeline, or specific requirements..."
                    />
                  </label>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="glow-brand inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
                    >
                      {status === "sending" ? "Sending enquiry..." : "Send enquiry"}{" "}
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>

                  {status === "sent" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400"
                    >
                      ✓ Thank you — your enquiry has been received. Our team will review your project and email you back within 24 hours.
                    </motion.div>
                  )}

                  {status === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400"
                    >
                      ✕ {errorMessage || "Something went wrong — please try again or email info@techagenz.com directly."}
                    </motion.div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Happens Next Section */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">What happens next?</h2>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              Our straightforward onboarding sequence takes you from initial conversation to active engineering.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Enquiry Review",
                desc: "We analyze your requirements and assemble relevant architecture notes within 24 hours.",
              },
              {
                step: "02",
                title: "Discovery Call",
                desc: "A focused 30-minute technical session to define constraints, stack, and milestones.",
              },
              {
                step: "03",
                title: "Detailed Proposal",
                desc: "You receive a clear proposal with deliverables, technical architecture, and sprint timelines.",
              },
              {
                step: "04",
                title: "Sprint Zero Kickoff",
                desc: "We initialize repository, CI/CD, and begin building the core production system.",
              },
            ].map((item, idx) => (
              <div key={item.step} className="glass-card rounded-2xl p-6">
                <span className="font-display text-2xl font-extrabold text-brand/80">{item.step}</span>
                <h3 className="mt-3 font-display text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ContactPage;
