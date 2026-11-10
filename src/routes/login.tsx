import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { TechCursor } from "@/components/TechCursor";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Admin Access Guidance — Tech Agenz" },
      {
        name: "description",
        content: "Cloudflare Access guidance for the Tech Agenz development admin.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background text-foreground flex flex-col justify-between">
      <TechCursor />
      <Nav />

      {/* Ambient background glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] rounded-full bg-blue-600/10 blur-[140px]" />
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-28 md:py-36">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Card container */}
          <div className="relative rounded-2xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
            {/* Subtle top cyan line */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            {/* Header */}
            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-5 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Cloudflare Access
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Admin identity is verified by Cloudflare Access, not by this website.
              </p>
            </div>

            <div className="mt-7 rounded-xl border border-white/10 bg-slate-900/60 p-4 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-medium text-slate-300 mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>Access-protected admin</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400 mb-4">
                This page does not authenticate you. Continue to the development admin hostname to
                begin the Cloudflare Access flow. A successful redirect or this page loading alone
                does not prove access was granted.
              </p>
              <a
                href="https://admin-dev.techagenz.com/admin"
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 px-4 text-sm font-semibold text-white shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] hover:brightness-110 active:scale-[0.99]"
              >
                <span>Continue to development admin</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>

            {/* Back link */}
            <div className="mt-6 text-center">
              <Link to="/" className="text-xs text-slate-400 hover:text-white transition">
                ← Back to Tech Agenz Home
              </Link>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

export default LoginPage;
