import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, Lock, LogIn, ShieldCheck, User } from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { TechCursor } from "@/components/TechCursor";
import { createAdminApiClient } from "@/api/admin-client";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Admin Portal Sign In — Tech Agenz" },
      {
        name: "description",
        content: "Sign in to the Tech Agenz production administrator console.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const adminApiClient = useMemo(
    () => createAdminApiClient(import.meta.env.VITE_ADMIN_API_BASE_URL),
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setError(null);

    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setError("Please provide both username and password.");
      return;
    }

    setIsLoading(true);

    try {
      await adminApiClient.login({
        username: cleanUsername,
        password,
      });
      // Clear password from memory immediately
      setPassword("");
      await navigate({ to: "/admin" });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid username or password. Please verify your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
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
            {/* Top cyan gradient highlight */}
            <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

            {/* Header */}
            <div className="text-center">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-5 shadow-[0_0_20px_rgba(34,211,238,0.2)]">
                <Lock className="h-7 w-7" />
              </div>
              <h1 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Admin Console Sign In
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Shared team authentication for the Tech Agenz portal.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300"
              >
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-7 space-y-4">
              <div>
                <label
                  htmlFor="admin-username"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Administrator Username
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    id="admin-username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter shared username"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    id="admin-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    placeholder="Enter password"
                    className="w-full rounded-xl border border-white/10 bg-slate-900/80 pl-10 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition disabled:opacity-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 px-4 text-sm font-semibold text-white shadow-[0_0_25px_rgba(34,211,238,0.3)] transition-all hover:shadow-[0_0_35px_rgba(34,211,238,0.5)] hover:brightness-110 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Admin</span>
                    <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            {/* Development Cloudflare Access Guidance */}
            <div className="mt-8 border-t border-white/10 pt-5">
              <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 font-medium text-cyan-300 mb-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Development Cloudflare Access</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-400 mb-2.5">
                  Are you accessing the development environment? Development uses Cloudflare Access
                  SSO verification instead of shared passwords.
                </p>
                <a
                  href="https://admin-dev.techagenz.com/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:underline transition"
                >
                  <span>Go to development portal (admin-dev)</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
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
