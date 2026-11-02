import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { TechCursor } from "@/components/TechCursor";
import { loginUser, isAuthenticated } from "@/lib/cms-store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Team Portal Login — Tech Agenz" },
      {
        name: "description",
        content: "Secure portal login for Tech Agenz team members and content administrators.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate({ to: "/admin" });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate minor security handshake delay
    setTimeout(() => {
      const res = loginUser(email, password);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate({ to: "/admin" });
        }, 600);
      } else {
        setError(res.message || "Invalid credentials. Please verify and try again.");
        setIsLoading(false);
      }
    }, 400);
  };

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
                Team Portal Login
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Log in to post blogs, update team members, and manage website content.
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <div className="flex-1 leading-relaxed">{error}</div>
              </motion.div>
            )}

            {/* Success Notification */}
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-6 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Authentication successful! Launching console...</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@techagenz.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-3 pl-10 pr-11 text-sm text-white placeholder-slate-500 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-200"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || success}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 px-4 text-sm font-semibold text-white shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] hover:brightness-110 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
              >
                {isLoading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <>
                    <span>Sign In to Console</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-7 rounded-xl border border-white/10 bg-slate-900/60 p-3.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-medium text-slate-300 mb-1">
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>Authorized Personnel Only</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                This internal portal is restricted to authorized Tech Agenz engineers and administrators. All login attempts are logged and monitored.
              </p>
            </div>

            {/* Back link */}
            <div className="mt-6 text-center">
              <Link
                to="/"
                className="text-xs text-slate-400 hover:text-white transition"
              >
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
