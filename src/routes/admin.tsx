import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  FileText,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Image as ImageIcon,
  Check,
  X,
  LogOut,
  ExternalLink,
  RefreshCw,
  Download,
  Shield,
  Sparkles,
  AlertTriangle,
  Eye,
  Search,
  CheckCircle2,
  Lock,
  Mail,
  Camera,
  GitBranch,
  Github,
  Key,
  EyeOff,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { TechCursor } from "@/components/TechCursor";
import {
  getTeamMembers,
  saveTeamMembers,
  addTeamMember,
  updateTeamMember,
  deleteTeamMember,
  resetTeamMembers,
  getBlogs,
  saveBlogs,
  addBlog,
  updateBlog,
  deleteBlog,
  resetBlogs,
  compressImageFile,
  isAuthenticated,
  getAuthSession,
  logoutUser,
  getAuthConfig,
  updateAuthConfig,
  exportCmsData,
  importCmsData,
  getGitHubConfig,
  saveGitHubConfig,
  testGitHubConnection,
  syncCmsToGitHub,
  CMS_SYNC_STATUS_EVENT,
  type GitHubConfig,
  AVATAR_PLACEHOLDER,
  type TeamMember,
} from "@/lib/cms-store";
import { blogCategories, type BlogPost } from "@/lib/blogs-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Team Content Console — Tech Agenz" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminDashboardPage,
});

const COLOR_PRESETS = [
  { name: "Cyan Glow", hex: "#22D3EE" },
  { name: "Sky Blue", hex: "#38BDF8" },
  { name: "Electric Blue", hex: "#2563EB" },
  { name: "Deep Ocean", hex: "#0EA5E9" },
  { name: "Teal Matrix", hex: "#0891B2" },
  { name: "Emerald AI", hex: "#10B981" },
  { name: "Purple Neon", hex: "#8B5CF6" },
];

function AdminDashboardPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"team" | "blogs" | "settings">("team");
  const [session, setSession] = useState<{ email: string; displayName: string } | null>(null);

  // Team state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    title: "",
    subtitle: "",
    borderColor: "#22D3EE",
    image: "",
  });

  // Blogs state
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogSearch, setBlogSearch] = useState("");
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);
  const [isAddBlogOpen, setIsAddBlogOpen] = useState(false);
  const [newBlogForm, setNewBlogForm] = useState<{
    title: string;
    category: BlogPost["category"];
    author: string;
    readTime: string;
    excerpt: string;
    image: string;
    keywords: string;
    keyTakeaways: string;
    content: string;
  }>({
    title: "",
    category: "AI & ML",
    author: "Ali Haider, Founder & AI Engineer",
    readTime: "5 min read",
    excerpt: "",
    image: "",
    keywords: "AI Software House, Custom Software, Tech Agenz",
    keyTakeaways: "Rapid delivery cycles\nTailored AI architecture\nEnterprise-grade data security",
    content: "Write the full article content here. You can add multiple paragraphs separated by line breaks.",
  });

  // Settings state
  const [settingsForm, setSettingsForm] = useState({
    email: "",
    password: "",
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // GitHub Auto-Sync State
  const [gitHubConfig, setGitHubConfig] = useState<GitHubConfig>(getGitHubConfig);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTestingGitHub, setIsTestingGitHub] = useState(false);
  const [gitTestResult, setGitTestResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
    warning?: string;
  } | null>(null);
  const [showToken, setShowToken] = useState(false);

  const importFileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Auth Protection
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate({ to: "/login" });
      return;
    }
    const currentSession = getAuthSession();
    if (currentSession) {
      setSession({ email: currentSession.email, displayName: currentSession.displayName });
    }

    // Load initial data
    setTeamMembers(getTeamMembers());
    setBlogs(getBlogs());
    setGitHubConfig(getGitHubConfig());

    const authConfig = getAuthConfig();
    setSettingsForm({ email: authConfig.email, password: authConfig.passwordHash });

    // Listen to custom updates from other components/tabs
    const handler = () => {
      setTeamMembers(getTeamMembers());
      setBlogs(getBlogs());
      setGitHubConfig(getGitHubConfig());
    };
    window.addEventListener("techagenz_cms_update", handler);

    // Listen to GitHub sync status events
    const syncStatusHandler = (e: Event) => {
      const customEvt = e as CustomEvent;
      const detail = customEvt.detail;
      if (!detail) return;
      if (detail.state === "syncing") {
        setIsSyncing(true);
      } else if (detail.state === "success") {
        setIsSyncing(false);
        setGitHubConfig(getGitHubConfig());
        showToast(detail.message || `✓ Synced with GitHub (${detail.commitSha})! Vercel is deploying.`);
      } else if (detail.state === "error") {
        setIsSyncing(false);
        setGitHubConfig(getGitHubConfig());
        if (detail.error) {
          showToast(`⚠️ Sync notice: ${detail.error.slice(0, 90)}`);
        }
      }
    };
    window.addEventListener(CMS_SYNC_STATUS_EVENT, syncStatusHandler);

    return () => {
      window.removeEventListener("techagenz_cms_update", handler);
      window.removeEventListener(CMS_SYNC_STATUS_EVENT, syncStatusHandler);
    };
  }, [navigate]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to sign out of the portal?")) {
      logoutUser();
      navigate({ to: "/login" });
    }
  };

  // ==================== GITHUB AUTO-SYNC HANDLERS ====================

  const handleTestGitHubConnection = async () => {
    setIsTestingGitHub(true);
    setGitTestResult(null);
    try {
      const res = await testGitHubConnection(gitHubConfig.token);
      setGitTestResult(res);
      if (res.success) {
        showToast(res.message || "✓ GitHub connection verified!");
      } else {
        showToast(`Connection failed: ${res.error || res.warning || "Check token"}`);
      }
    } finally {
      setIsTestingGitHub(false);
    }
  };

  const handleSaveGitHubSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveGitHubConfig(gitHubConfig);
    setGitHubConfig(updated);
    showToast("GitHub Auto-Sync configuration saved!");
  };

  const handleManualGitHubSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    showToast("Syncing all blogs and team members to GitHub repository...");
    try {
      const res = await syncCmsToGitHub("Manual sync from Tech Agenz CMS Console");
      if (res.success) {
        setGitHubConfig(getGitHubConfig());
        showToast(`✓ Synced to GitHub (${res.commitSha})! Vercel is deploying.`);
      } else {
        showToast(`Sync failed: ${res.error || "Unknown error"}`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // ==================== TEAM MEMBER HANDLERS ====================

  const handleMemberImageUpload = async (file: File, targetMemberId?: string) => {
    try {
      showToast("Optimizing and uploading image...");
      const compressed = await compressImageFile(file, {
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.85,
        mimeType: "image/webp",
      });

      if (targetMemberId) {
        // Direct update on existing member
        updateTeamMember(targetMemberId, { image: compressed });
        setTeamMembers(getTeamMembers());
        showToast("Team member photo updated & auto-syncing in background!");
      } else if (editingMember) {
        // Updating in edit modal
        setEditingMember({ ...editingMember, image: compressed });
      } else {
        // New member modal
        setNewMemberForm((prev) => ({ ...prev, image: compressed }));
        showToast("Photo attached to new member!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      alert(`Error uploading image: ${msg}`);
    }
  };

  const handleSaveAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberForm.title.trim() || !newMemberForm.subtitle.trim()) {
      alert("Please provide both Name and Role for the member.");
      return;
    }

    addTeamMember({
      title: newMemberForm.title.trim(),
      subtitle: newMemberForm.subtitle.trim(),
      borderColor: newMemberForm.borderColor,
      image: newMemberForm.image || AVATAR_PLACEHOLDER,
    });

    setTeamMembers(getTeamMembers());
    setIsAddMemberOpen(false);
    setNewMemberForm({
      title: "",
      subtitle: "",
      borderColor: "#22D3EE",
      image: "",
    });
    showToast("New team member added & auto-syncing in background!");
  };

  const handleSaveEditMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;

    updateTeamMember(editingMember.id, {
      title: editingMember.title.trim(),
      subtitle: editingMember.subtitle.trim(),
      borderColor: editingMember.borderColor,
      image: editingMember.image,
    });

    setTeamMembers(getTeamMembers());
    setEditingMember(null);
    showToast("Team member details saved & auto-syncing in background!");
  };

  const handleDeleteMember = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the team?`)) {
      deleteTeamMember(id);
      setTeamMembers(getTeamMembers());
      showToast(`${name} removed & auto-syncing in background.`);
    }
  };

  const handleResetTeam = () => {
    if (
      window.confirm(
        "Reset team list to original defaults? This will restore original members and remove custom entries.",
      )
    ) {
      resetTeamMembers();
      setTeamMembers(getTeamMembers());
      showToast("Team reset to defaults.");
    }
  };

  // ==================== BLOG POST HANDLERS ====================

  const handleBlogImageUpload = async (file: File, isEdit = false) => {
    try {
      showToast("Optimizing blog banner image...");
      const compressed = await compressImageFile(file, {
        maxWidth: 1200,
        maxHeight: 750,
        quality: 0.82,
        mimeType: "image/webp",
      });

      if (isEdit && editingBlog) {
        setEditingBlog({ ...editingBlog, image: compressed });
        showToast("Blog banner updated in draft!");
      } else {
        setNewBlogForm((prev) => ({ ...prev, image: compressed }));
        showToast("Blog banner attached!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to upload image";
      alert(`Error uploading banner: ${msg}`);
    }
  };

  const handleSaveAddBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogForm.title.trim() || !newBlogForm.excerpt.trim()) {
      alert("Please provide both a Title and Excerpt.");
      return;
    }

    const keywords = newBlogForm.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    const keyTakeaways = newBlogForm.keyTakeaways
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);

    const content = newBlogForm.content
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean);

    addBlog({
      title: newBlogForm.title.trim(),
      category: newBlogForm.category,
      author: newBlogForm.author.trim() || "Tech Agenz Engineering",
      readTime: newBlogForm.readTime.trim() || "5 min read",
      excerpt: newBlogForm.excerpt.trim(),
      image: newBlogForm.image || "/blog-images/ai-software-house-pakistan.webp",
      keywords: keywords.length > 0 ? keywords : ["Tech Agenz", "Software House"],
      keyTakeaways: keyTakeaways.length > 0 ? keyTakeaways : ["Comprehensive engineering delivery."],
      content: content.length > 0 ? content : [newBlogForm.excerpt.trim()],
    });

    setBlogs(getBlogs());
    setIsAddBlogOpen(false);
    setNewBlogForm({
      title: "",
      category: "AI & ML",
      author: "Ali Haider, Founder & AI Engineer",
      readTime: "5 min read",
      excerpt: "",
      image: "",
      keywords: "AI Software House, Custom Software, Tech Agenz",
      keyTakeaways: "Rapid delivery cycles\nTailored AI architecture\nEnterprise-grade data security",
      content: "",
    });
    showToast("Blog post published & auto-syncing in background!");
  };

  const handleSaveEditBlog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog) return;

    updateBlog(editingBlog.id, {
      title: editingBlog.title,
      category: editingBlog.category,
      author: editingBlog.author,
      readTime: editingBlog.readTime,
      excerpt: editingBlog.excerpt,
      image: editingBlog.image,
      keywords: editingBlog.keywords,
      keyTakeaways: editingBlog.keyTakeaways,
      content: editingBlog.content,
    });

    setBlogs(getBlogs());
    setEditingBlog(null);
    showToast("Blog updated & auto-syncing in background!");
  };

  const handleDeleteBlog = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete the blog post "${title}"?`)) {
      deleteBlog(id);
      setBlogs(getBlogs());
      showToast("Blog post deleted & auto-syncing in background.");
    }
  };

  const handleResetBlogs = () => {
    if (
      window.confirm(
        "Reset all blogs to original defaults? Any custom blog posts will be removed.",
      )
    ) {
      resetBlogs();
      setBlogs(getBlogs());
      showToast("Blogs reset to default 12 articles.");
    }
  };

  // ==================== SETTINGS & BACKUP HANDLERS ====================

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm.email.trim() || !settingsForm.password.trim()) {
      alert("Email and password cannot be empty.");
      return;
    }
    updateAuthConfig({
      email: settingsForm.email.trim(),
      passwordHash: settingsForm.password.trim(),
    });
    showToast("Admin credentials updated successfully!");
  };

  const handleExportBackup = () => {
    const backup = exportCmsData();
    const jsonStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `techagenz-cms-backup-${dateStr}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Backup JSON file downloaded!");
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const res = importCmsData(parsed);
        if (res.success) {
          setTeamMembers(getTeamMembers());
          setBlogs(getBlogs());
          showToast("Data backup successfully restored!");
        } else {
          alert(`Import failed: ${res.message}`);
        }
      } catch {
        alert("Invalid JSON file format.");
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = "";
  };

  const filteredBlogs = blogs.filter((b) => {
    const q = blogSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      b.title.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-between">
      <TechCursor />
      <Nav />

      {/* Floating toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-6 z-50 flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-slate-900/95 px-4 py-3 text-sm text-cyan-300 shadow-2xl backdrop-blur-xl"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0 text-cyan-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-28 md:py-32 max-w-7xl mx-auto w-full">
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                <Shield className="h-3 w-3" />
                <span>Admin Console</span>
              </span>
              <span className="text-xs text-slate-400">
                Signed in as <strong className="text-white">{session?.email || "Team"}</strong>
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Tech Agenz Website Manager
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Directly edit and publish blogs, update team member names and photos without writing code.
            </p>
            {gitHubConfig.token ? (
              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Auto-Sync Active: Changes are automatically saved & synced to all devices in background</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("settings")}
                  className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-medium text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                >
                  <AlertTriangle className="h-3 w-3" />
                  <span>Connect GitHub in Settings once to enable permanent auto-sync on all devices</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* GitHub Sync Status Badge */}
            {isSyncing ? (
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                <span>Syncing to GitHub...</span>
              </span>
            ) : gitHubConfig.token ? (
              <a
                href={gitHubConfig.lastCommitUrl || `https://github.com/${gitHubConfig.repoOwner}/${gitHubConfig.repoName}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition cursor-pointer"
                title={`Connected to ${gitHubConfig.repoOwner}/${gitHubConfig.repoName} (${gitHubConfig.branch}). Click to view on GitHub.`}
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <Github className="h-3.5 w-3.5" />
                <span>GitHub Synced {gitHubConfig.lastCommitSha ? `(${gitHubConfig.lastCommitSha})` : ""}</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
                title="Click to set up GitHub Auto-Sync token"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>Setup GitHub Sync</span>
              </button>
            )}

            {/* Quick Sync Button */}
            <button
              type="button"
              onClick={handleManualGitHubSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/20 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/30 transition disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.15)]"
              title="Manual Sync: Changes already auto-sync automatically. Click to force an immediate push."
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin text-cyan-400" : ""}`} />
              <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
            </button>

            <Link
              to="/"
              target="_blank"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-300 hover:border-cyan-500/40 hover:text-white transition"
            >
              <span>View Site</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="mt-8 flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("team")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition cursor-pointer ${
              activeTab === "team"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Team Members</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === "team" ? "bg-slate-950/30 text-slate-950" : "bg-white/10 text-slate-300"
              }`}
            >
              {teamMembers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("blogs")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition cursor-pointer ${
              activeTab === "blogs"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Blog Articles</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                activeTab === "blogs" ? "bg-slate-950/30 text-slate-950" : "bg-white/10 text-slate-300"
              }`}
            >
              {blogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition cursor-pointer ${
              activeTab === "settings"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Settings & Backup</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: TEAM MEMBERS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === "team" && (
          <div className="mt-8 space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div>
                <h2 className="text-lg font-bold text-white">Team Directory</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Changes made here update the homepage and About page instantly.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetTeam}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white hover:border-white/20 transition cursor-pointer"
                  title="Reset team list to original defaults"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:brightness-110 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Member</span>
                </button>
              </div>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="group relative rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-lg backdrop-blur-sm transition hover:border-cyan-500/40"
                  style={{
                    boxShadow: `0 0 25px ${member.borderColor || "#22D3EE"}15`,
                  }}
                >
                  {/* Member Card Header */}
                  <div className="flex items-start gap-4">
                    {/* Member Photo with quick upload overlay */}
                    <div className="relative shrink-0 group/photo">
                      <div
                        className="h-20 w-20 rounded-2xl overflow-hidden border-2 bg-slate-900"
                        style={{ borderColor: member.borderColor || "#22D3EE" }}
                      >
                        <img
                          src={member.image}
                          alt={member.title}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      {/* Quick upload button over image */}
                      <label
                        className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/70 opacity-0 group-hover/photo:opacity-100 transition cursor-pointer text-[10px] text-cyan-300 font-medium"
                        title="Click to replace this picture"
                      >
                        <Camera className="h-4 w-4 mb-0.5" />
                        <span>Change</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleMemberImageUpload(file, member.id);
                          }}
                        />
                      </label>
                    </div>

                    {/* Member Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white truncate">{member.title}</h3>
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: member.borderColor || "#22D3EE" }}
                          title="Accent glow color"
                        />
                      </div>
                      <p className="text-xs text-cyan-400 mt-0.5 truncate">{member.subtitle}</p>

                      <div className="mt-3 flex items-center gap-2">
                        {/* Change Photo label button */}
                        <label className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-medium text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer">
                          <Upload className="h-3 w-3" />
                          <span>Upload Picture</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleMemberImageUpload(file, member.id);
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setEditingMember(member)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-cyan-500/40 hover:text-white transition cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit Name & Role</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member.id, member.title)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Delete member"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: BLOG POSTS MANAGEMENT */}
        {/* ======================================================== */}
        {activeTab === "blogs" && (
          <div className="mt-8 space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={blogSearch}
                    onChange={(e) => setBlogSearch(e.target.value)}
                    placeholder="Search articles by title, author, category..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleResetBlogs}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-3.5 py-2 text-xs font-medium text-slate-400 hover:text-white hover:border-white/20 transition cursor-pointer"
                  title="Reset to 12 original blog posts"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reset Defaults</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddBlogOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:brightness-110 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Post New Blog</span>
                </button>
              </div>
            </div>

            {/* Blogs List */}
            <div className="space-y-4">
              {filteredBlogs.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-sm transition hover:border-cyan-500/40"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-20 w-28 shrink-0 rounded-xl object-cover border border-white/10 bg-slate-900"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                          {post.category}
                        </span>
                        <span className="text-[11px] text-slate-500">{post.date}</span>
                        <span className="text-[11px] text-slate-500">• {post.readTime}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{post.excerpt}</p>
                      <p className="text-[11px] text-slate-500 mt-1">Author: {post.author}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                    <Link
                      to="/blogs/$slug"
                      params={{ slug: post.id }}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setEditingBlog(post)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBlog(post.id, post.title)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/20 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: SETTINGS & BACKUP */}
        {/* ======================================================== */}
        {activeTab === "settings" && (
          <div className="mt-8 space-y-8">
            {/* GitHub Auto-Sync & Deployment Card */}
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-950/90 to-slate-900/90 p-6 sm:p-8 backdrop-blur-sm shadow-[0_0_30px_rgba(34,211,238,0.1)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                    <Github className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-white">GitHub Auto-Sync & Global Deployment</h2>
                      <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-400">
                        <GitBranch className="h-3 w-3" />
                        <span>{gitHubConfig.branch}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      Automatically commits changes to your repository (<strong className="text-white">{gitHubConfig.repoOwner}/{gitHubConfig.repoName}</strong>).
                      When committed, Vercel automatically deploys your updates so they are immediately live for every visitor across all browsers.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleManualGitHubSync}
                    disabled={isSyncing}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.3)] disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                    <span>{isSyncing ? "Syncing..." : "Sync to GitHub Now"}</span>
                  </button>
                </div>
              </div>

              {/* Status Banner */}
              <div className="mt-6">
                {gitHubConfig.token ? (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white">
                          Connected to GitHub ({gitHubConfig.repoOwner}/{gitHubConfig.repoName})
                        </div>
                        <div className="text-slate-300 mt-0.5">
                          Auto-Sync is <strong className="text-emerald-300">{gitHubConfig.autoSync ? "ENABLED" : "PAUSED"}</strong>.
                          Every blog or team change commits directly to branch <code className="text-cyan-300 bg-black/40 px-1 py-0.5 rounded">{gitHubConfig.branch}</code>.
                        </div>
                        {gitHubConfig.lastSyncTime && (
                          <div className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-2">
                            <span>Last synced: {new Date(gitHubConfig.lastSyncTime).toLocaleString()}</span>
                            {gitHubConfig.lastCommitSha && (
                              <a
                                href={gitHubConfig.lastCommitUrl || `https://github.com/${gitHubConfig.repoOwner}/${gitHubConfig.repoName}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:underline flex items-center gap-1 font-mono"
                              >
                                <span>Commit {gitHubConfig.lastCommitSha}</span>
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-200">
                    <div className="flex items-start gap-2.5">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                      <div>
                        <div className="font-semibold text-white">
                          GitHub Token Needed for Cloud Auto-Sync
                        </div>
                        <div className="text-slate-300 mt-0.5">
                          To have your changes automatically update the live website on all devices and preserve data in Git, enter your GitHub Personal Access Token below.
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Settings */}
              <form onSubmit={handleSaveGitHubSettings} className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Token Field */}
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        GitHub Personal Access Token (PAT)
                      </label>
                      <a
                        href="https://github.com/settings/tokens/new?scopes=repo&description=TechAgenz+CMS+Sync"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                      >
                        <span>Generate Token on GitHub</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="relative">
                      <input
                        type={showToken ? "text" : "password"}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        value={gitHubConfig.token}
                        onChange={(e) =>
                          setGitHubConfig({ ...gitHubConfig, token: e.target.value.trim() })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 pl-3.5 pr-20 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-slate-400 hover:text-white text-xs flex items-center gap-1 cursor-pointer"
                      >
                        {showToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        <span className="text-[10px]">{showToken ? "Hide" : "Show"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Branch */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Target Branch
                    </label>
                    <input
                      type="text"
                      value={gitHubConfig.branch}
                      onChange={(e) =>
                        setGitHubConfig({ ...gitHubConfig, branch: e.target.value.trim() })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      GitHub Repository Owner
                    </label>
                    <input
                      type="text"
                      value={gitHubConfig.repoOwner}
                      onChange={(e) =>
                        setGitHubConfig({ ...gitHubConfig, repoOwner: e.target.value.trim() })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Repository Name
                    </label>
                    <input
                      type="text"
                      value={gitHubConfig.repoName}
                      onChange={(e) =>
                        setGitHubConfig({ ...gitHubConfig, repoName: e.target.value.trim() })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                {/* AutoSync Checkbox & Actions */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-white/10">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={gitHubConfig.autoSync}
                      onChange={(e) =>
                        setGitHubConfig({ ...gitHubConfig, autoSync: e.target.checked })
                      }
                      className="h-4 w-4 rounded border-white/20 bg-slate-900 text-cyan-500 accent-cyan-400"
                    />
                    <span className="text-xs text-slate-300">
                      Enable Auto-Sync (Automatically push changes on every save, add, or delete)
                    </span>
                  </label>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTestGitHubConnection}
                      disabled={isTestingGitHub}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white hover:border-cyan-500/40 transition cursor-pointer disabled:opacity-50"
                    >
                      {isTestingGitHub ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Key className="h-3.5 w-3.5 text-cyan-400" />
                      )}
                      <span>{isTestingGitHub ? "Testing..." : "Test Connection"}</span>
                    </button>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 py-2.5 px-5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Save GitHub Settings</span>
                    </button>
                  </div>
                </div>

                {/* Test Result Message */}
                {gitTestResult && (
                  <div
                    className={`rounded-xl p-3 text-xs flex items-center gap-2 ${
                      gitTestResult.success
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                        : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {gitTestResult.success ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                    )}
                    <span>{gitTestResult.message || gitTestResult.error || gitTestResult.warning}</span>
                  </div>
                )}
              </form>

              {/* Instructions Guide */}
              <div className="mt-6 rounded-xl border border-white/5 bg-slate-900/60 p-4 text-xs text-slate-400">
                <div className="font-semibold text-white mb-1.5 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  <span>How GitHub Auto-Sync keeps your data permanently safe everywhere:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                  <li>
                    When you post or update a blog or team member, Tech Agenz CMS commits the updated <code className="text-cyan-300">src/data/cms-data.json</code> directly to your GitHub repository.
                  </li>
                  <li>
                    GitHub receives the commit and immediately notifies Vercel to rebuild.
                  </li>
                  <li>
                    Vercel builds and publishes the new version worldwide. Every browser, mobile device, or visitor opening <strong className="text-white">techagenz.com</strong> sees the updated content.
                  </li>
                  <li>
                    Your data is never lost because it is permanently saved in your GitHub Git commit history!
                  </li>
                </ol>
              </div>
            </div>

            {/* Grid of Credentials & Backup */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Credentials Card */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 sm:p-8 backdrop-blur-sm">
              <div className="flex items-center gap-2.5 mb-2">
                <Lock className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">Admin Credentials</h2>
              </div>
              <p className="text-xs text-slate-400 mb-6">
                Change the login email and password used by your team to access this portal.
              </p>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Login Email
                  </label>
                  <input
                    type="email"
                    required
                    value={settingsForm.email}
                    onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    Password
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.password}
                    onChange={(e) => setSettingsForm({ ...settingsForm, password: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 py-2.5 px-5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Save New Credentials</span>
                </button>
              </form>
            </div>

            {/* Backup & Export Card */}
            <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-6 sm:p-8 backdrop-blur-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <Download className="h-5 w-5 text-cyan-400" />
                  <h2 className="text-lg font-bold text-white">Data Backup & Sync</h2>
                </div>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Export all your edited blogs and team members into a single JSON file. You can import this file anytime to restore data or sync across different browsers.
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 py-3 px-4 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download JSON Backup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => importFileInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-slate-900/90 py-3 px-4 text-xs font-semibold text-slate-300 hover:text-white hover:border-white/20 transition cursor-pointer"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Restore / Import JSON Backup</span>
                  </button>
                  <input
                    ref={importFileInputRef}
                    type="file"
                    accept=".json,application/json"
                    className="hidden"
                    onChange={handleImportBackup}
                  />
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs text-amber-300/80">
                <div className="flex items-center gap-2 font-medium text-amber-400 mb-1">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  <span>Browser Storage Notice</span>
                </div>
                <span>
                  All content is preserved in browser storage. Download an export after big changes to keep a secure permanent copy.
                </span>
              </div>
            </div>
          </div>
        </div>
        )}

        {/* ======================================================== */}
        {/* MODAL: ADD NEW TEAM MEMBER */}
        {/* ======================================================== */}
        <AnimatePresence>
          {isAddMemberOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-slate-950 p-6 sm:p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-cyan-400" />
                    <span>Add New Team Member</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddMemberOpen(false)}
                    className="rounded-lg p-1 text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveAddMember} className="mt-6 space-y-4">
                  {/* Photo Upload Box */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-cyan-400 bg-slate-900 shrink-0">
                        <img
                          src={newMemberForm.image || AVATAR_PLACEHOLDER}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-3.5 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/30 transition cursor-pointer">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Choose Photo from Device</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleMemberImageUpload(file);
                            }}
                          />
                        </label>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Accepts PNG, JPG, WebP. Automatically optimized.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Hassan Tariq"
                      value={newMemberForm.title}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, title: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Role / Subtitle
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior DevOps & Cloud Architect"
                      value={newMemberForm.subtitle}
                      onChange={(e) =>
                        setNewMemberForm({ ...newMemberForm, subtitle: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Card Border Glow Accent
                    </label>
                    <div className="flex items-center gap-2">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() =>
                            setNewMemberForm({ ...newMemberForm, borderColor: color.hex })
                          }
                          className={`h-7 w-7 rounded-full border-2 transition cursor-pointer ${
                            newMemberForm.borderColor === color.hex
                              ? "scale-110 border-white ring-2 ring-cyan-400/50"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setIsAddMemberOpen(false)}
                      className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:brightness-110 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Save & Add Member</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* MODAL: EDIT TEAM MEMBER */}
        {/* ======================================================== */}
        <AnimatePresence>
          {editingMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-slate-950 p-6 sm:p-8 shadow-2xl"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit2 className="h-5 w-5 text-cyan-400" />
                    <span>Edit Team Member</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="rounded-lg p-1 text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditMember} className="mt-6 space-y-4">
                  {/* Photo Edit */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 rounded-2xl overflow-hidden border-2 border-cyan-400 bg-slate-900 shrink-0">
                        <img
                          src={editingMember.image}
                          alt={editingMember.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-3.5 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/30 transition cursor-pointer">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Replace Picture</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleMemberImageUpload(file);
                            }}
                          />
                        </label>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Changes take effect immediately on save.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMember.title}
                      onChange={(e) =>
                        setEditingMember({ ...editingMember, title: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Role / Subtitle
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMember.subtitle}
                      onChange={(e) =>
                        setEditingMember({ ...editingMember, subtitle: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Border Glow Accent
                    </label>
                    <div className="flex items-center gap-2">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() =>
                            setEditingMember({ ...editingMember, borderColor: color.hex })
                          }
                          className={`h-7 w-7 rounded-full border-2 transition cursor-pointer ${
                            editingMember.borderColor === color.hex
                              ? "scale-110 border-white ring-2 ring-cyan-400/50"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* MODAL: POST NEW BLOG */}
        {/* ======================================================== */}
        <AnimatePresence>
          {isAddBlogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl my-8 rounded-2xl border border-cyan-500/30 bg-slate-950 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/10 sticky top-0 bg-slate-950 z-10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-cyan-400" />
                    <span>Publish New Blog Post</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddBlogOpen(false)}
                    className="rounded-lg p-1 text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveAddBlog} className="mt-6 space-y-4">
                  {/* Banner Image Upload Box */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Cover Banner Image
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {newBlogForm.image && (
                        <img
                          src={newBlogForm.image}
                          alt="Banner preview"
                          className="h-24 w-40 rounded-xl object-cover border border-cyan-500/40 bg-slate-900"
                        />
                      )}
                      <div className="space-y-2">
                        <label className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-4 py-2.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/30 transition cursor-pointer">
                          <Upload className="h-4 w-4" />
                          <span>Upload Picture (PNG, JPG, WebP)</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleBlogImageUpload(file, false);
                            }}
                          />
                        </label>
                        <p className="text-[11px] text-slate-400">
                          Automatically resized and optimized for high-speed page loads.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Article Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Next-Gen Enterprise AI Automation in Pakistan"
                      value={newBlogForm.title}
                      onChange={(e) => setNewBlogForm({ ...newBlogForm, title: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Category
                      </label>
                      <select
                        value={newBlogForm.category}
                        onChange={(e) =>
                          setNewBlogForm({
                            ...newBlogForm,
                            category: e.target.value as BlogPost["category"],
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white outline-none focus:border-cyan-500"
                      >
                        {blogCategories
                          .filter((c) => c !== "All")
                          .map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Author Name
                      </label>
                      <input
                        type="text"
                        value={newBlogForm.author}
                        onChange={(e) => setNewBlogForm({ ...newBlogForm, author: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Estimated Read Time
                      </label>
                      <input
                        type="text"
                        value={newBlogForm.readTime}
                        onChange={(e) =>
                          setNewBlogForm({ ...newBlogForm, readTime: e.target.value })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Short Excerpt / Meta Description
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Brief 2-3 sentence overview for search engines and preview cards..."
                      value={newBlogForm.excerpt}
                      onChange={(e) => setNewBlogForm({ ...newBlogForm, excerpt: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Key Takeaways (one per line)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Key bullet point 1&#10;Key bullet point 2&#10;Key bullet point 3"
                      value={newBlogForm.keyTakeaways}
                      onChange={(e) =>
                        setNewBlogForm({ ...newBlogForm, keyTakeaways: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Full Article Content (paragraphs separated by blank lines)
                    </label>
                    <textarea
                      rows={6}
                      required
                      placeholder="Write your article here..."
                      value={newBlogForm.content}
                      onChange={(e) => setNewBlogForm({ ...newBlogForm, content: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Keywords / SEO Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="AI Software House, Pakistan Tech, ERPNext"
                      value={newBlogForm.keywords}
                      onChange={(e) => setNewBlogForm({ ...newBlogForm, keywords: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2 px-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10 sticky bottom-0 bg-slate-950 py-2">
                    <button
                      type="button"
                      onClick={() => setIsAddBlogOpen(false)}
                      className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-2.5 text-xs font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:brightness-110 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Publish Article</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ======================================================== */}
        {/* MODAL: EDIT BLOG POST */}
        {/* ======================================================== */}
        <AnimatePresence>
          {editingBlog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl my-8 rounded-2xl border border-cyan-500/30 bg-slate-950 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/10 sticky top-0 bg-slate-950 z-10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Edit2 className="h-5 w-5 text-cyan-400" />
                    <span>Edit Blog Post</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setEditingBlog(null)}
                    className="rounded-lg p-1 text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveEditBlog} className="mt-6 space-y-4">
                  {/* Banner image change */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Banner Image
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <img
                        src={editingBlog.image}
                        alt="Current banner"
                        className="h-24 w-40 rounded-xl object-cover border border-cyan-500/40 bg-slate-900"
                      />
                      <label className="inline-flex items-center gap-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 px-4 py-2.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/30 transition cursor-pointer">
                        <Upload className="h-4 w-4" />
                        <span>Upload New Picture</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleBlogImageUpload(file, true);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={editingBlog.title}
                      onChange={(e) => setEditingBlog({ ...editingBlog, title: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Category
                      </label>
                      <select
                        value={editingBlog.category}
                        onChange={(e) =>
                          setEditingBlog({
                            ...editingBlog,
                            category: e.target.value as BlogPost["category"],
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white outline-none focus:border-cyan-500"
                      >
                        {blogCategories
                          .filter((c) => c !== "All")
                          .map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Author
                      </label>
                      <input
                        type="text"
                        value={editingBlog.author}
                        onChange={(e) => setEditingBlog({ ...editingBlog, author: e.target.value })}
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white outline-none focus:border-cyan-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Read Time
                      </label>
                      <input
                        type="text"
                        value={editingBlog.readTime}
                        onChange={(e) =>
                          setEditingBlog({ ...editingBlog, readTime: e.target.value })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Excerpt
                    </label>
                    <textarea
                      rows={2}
                      value={editingBlog.excerpt}
                      onChange={(e) => setEditingBlog({ ...editingBlog, excerpt: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2 px-3.5 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Key Takeaways (one per line)
                    </label>
                    <textarea
                      rows={3}
                      value={editingBlog.keyTakeaways.join("\n")}
                      onChange={(e) =>
                        setEditingBlog({
                          ...editingBlog,
                          keyTakeaways: e.target.value.split("\n").filter(Boolean),
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2 px-3.5 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Content (paragraphs separated by blank lines)
                    </label>
                    <textarea
                      rows={6}
                      value={editingBlog.content.join("\n\n")}
                      onChange={(e) =>
                        setEditingBlog({
                          ...editingBlog,
                          content: e.target.value.split("\n\n").filter(Boolean),
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10 sticky bottom-0 bg-slate-950 py-2">
                    <button
                      type="button"
                      onClick={() => setEditingBlog(null)}
                      className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-xs font-semibold text-slate-950 hover:bg-cyan-400 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default AdminDashboardPage;
