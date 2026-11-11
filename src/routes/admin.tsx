import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  FileText,
  Briefcase,
  Mail,
  Image as ImageIcon,
  Settings,
  Plus,
  Trash2,
  Edit2,
  Upload,
  Check,
  X,
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
  Camera,
  Server,
  Database,
  ShieldCheck,
  Copy,
  Tag,
  Clock,
  Layers,
  ChevronRight,
} from "lucide-react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { TechCursor } from "@/components/TechCursor";
import {
  getTeamMembers,
  getBlogs,
  exportCmsData,
  AVATAR_PLACEHOLDER,
  type TeamMember,
} from "@/lib/cms-store";
import { blogCategories, type BlogPost } from "@/lib/blogs-data";
import { projects as defaultProjects, type CaseStudy } from "@/lib/projects-data";
import {
  createAdminApiClient,
  type AdminApiAccessState,
  type EnquiryDto,
  type MediaAssetDto,
} from "@/api/admin-client";
import type { TeamMemberDto, BlogDetailDto, CaseStudyDto } from "@/api/cms-client";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Content Console — Tech Agenz" },
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
  const [activeTab, setActiveTab] = useState<
    "team" | "blogs" | "projects" | "enquiries" | "media" | "settings"
  >("team");
  const [adminApiCheckVersion, setAdminApiCheckVersion] = useState(0);

  const adminApiClient = useMemo(
    () => createAdminApiClient(import.meta.env.VITE_ADMIN_API_BASE_URL),
    [],
  );
  const [adminApiAccessState, setAdminApiAccessState] = useState<AdminApiAccessState>(
    adminApiClient.accessUrl ? "checking" : "unconfigured",
  );
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [adminUsername, setAdminUsername] = useState<string | null>(null);
  const [authType, setAuthType] = useState<"cloudflare_access" | "session" | null>(null);

  // General state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Team state
  const [teamMembers, setTeamMembers] = useState<TeamMemberDto[]>([]);
  const [editingMember, setEditingMember] = useState<TeamMemberDto | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState<{
    name: string;
    role: string;
    borderColor: string;
    image: string;
    sortOrder: number;
  }>({
    name: "",
    role: "",
    borderColor: "#22D3EE",
    image: "",
    sortOrder: 1,
  });

  // Blogs state
  const [blogs, setBlogs] = useState<BlogDetailDto[]>([]);
  const [blogSearch, setBlogSearch] = useState("");
  const [editingBlog, setEditingBlog] = useState<BlogDetailDto | null>(null);
  const [isAddBlogOpen, setIsAddBlogOpen] = useState(false);
  const [newBlogForm, setNewBlogForm] = useState<{
    title: string;
    category: string;
    author: string;
    readTime: string;
    excerpt: string;
    image: string;
    featured: boolean;
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
    featured: false,
    keywords: "AI Software House, Custom Software, Tech Agenz",
    keyTakeaways: "Rapid delivery cycles\nTailored AI architecture\nEnterprise-grade data security",
    content: "Write the full article content here. Separate paragraphs with double newlines.",
  });

  // Projects state
  const [projects, setProjects] = useState<CaseStudyDto[]>([]);
  const [projectSearch, setProjectSearch] = useState("");
  const [editingProject, setEditingProject] = useState<CaseStudyDto | null>(null);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState<{
    title: string;
    slug: string;
    shortTitle: string;
    category: string;
    clientName: string;
    clientType: string;
    coverImage: string;
    timeline: string;
    status: string;
    featuredOnHome: boolean;
    order: number;
    problemHeading: string;
    problemDescription: string;
    painPoints: string;
    solutionHeading: string;
    solutionDescription: string;
    deliverables: string;
    stack: string;
    architectureOverview: string;
    stats: string;
    bullets: string;
    testimonialQuote: string;
    testimonialAuthor: string;
  }>({
    title: "",
    slug: "",
    shortTitle: "",
    category: "AI & Web Solutions",
    clientName: "",
    clientType: "Enterprise Client",
    coverImage: "",
    timeline: "6 Weeks",
    status: "Live in Production",
    featuredOnHome: true,
    order: 1,
    problemHeading: "Core Operational Challenge",
    problemDescription: "Describe the bottlenecks faced by the client.",
    painPoints: "Manual paper processes\nFrequent scheduling collisions\nData fragmentation",
    solutionHeading: "Automated Digital Infrastructure",
    solutionDescription: "Describe the custom platform engineered by Tech Agenz.",
    deliverables: "High-throughput Worker API\nD1 Structured Storage\nAdmin Portal",
    stack: "React, TypeScript, Cloudflare Workers, D1, Tailwind CSS",
    architectureOverview: "Edge-routed architecture deployed on Cloudflare Workers.",
    stats: "99.9% | Availability | Zero downtime\n5x | Processing Speed | Sub-second latency",
    bullets: "Eliminated all manual scheduling conflicts\nAutomated real-time notifications",
    testimonialQuote: "Tech Agenz built exactly what our organization needed.",
    testimonialAuthor: "Operations Director",
  });

  // Enquiries state
  const [enquiries, setEnquiries] = useState<EnquiryDto[]>([]);
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<string>("all");
  const [enquiryCounts, setEnquiryCounts] = useState<{
    total: number;
    new: number;
    read: number;
    replied: number;
    archived: number;
  }>({ total: 0, new: 0, read: 0, replied: 0, archived: 0 });

  // Media Library state
  const [mediaAssets, setMediaAssets] = useState<MediaAssetDto[]>([]);
  const [mediaFolderFilter, setMediaFolderFilter] = useState<string>("all");
  const [mediaSearch, setMediaSearch] = useState<string>("");
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // ── Access Probe ────────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    if (!adminApiClient.accessUrl) {
      setAdminApiAccessState("unconfigured");
      return () => {
        active = false;
      };
    }

    setAdminApiAccessState("checking");
    void adminApiClient.verifyAccess().then((result) => {
      if (active) {
        setAdminApiAccessState(result.state);
        if (result.email) setAdminEmail(result.email);
        if (result.username) setAdminUsername(result.username);
        if (result.authType) setAuthType(result.authType);
      }
    });

    return () => {
      active = false;
    };
  }, [adminApiClient, adminApiCheckVersion]);

  // ── Initial Data Loading ────────────────────────────────────────────────
  const loadLocalFallback = useCallback(() => {
    const localTeam = getTeamMembers().map((m, idx) => ({
      id: m.id,
      name: m.title,
      role: m.subtitle,
      image: m.image,
      borderColor: m.borderColor || "#22D3EE",
      gradient: m.gradient || "",
      sortOrder: idx + 1,
    }));
    setTeamMembers(localTeam);

    const localBlogs = getBlogs().map((b) => ({
      ...b,
      featured: Boolean(b.featured),
      keywords: b.keywords || [],
      keyTakeaways: b.keyTakeaways || [],
      content: b.content || [],
    }));
    setBlogs(localBlogs);

    const localProjects = defaultProjects.map((p) => ({
      ...p,
      problem: {
        ...p.problem,
        painPoints: p.problem.painPoints || [],
      },
      solution: {
        ...p.solution,
        keyDeliverables: p.solution.keyDeliverables || [],
      },
      stack: p.stack || [],
      architecture: {
        ...p.architecture,
        flowSteps: p.architecture.flowSteps || [],
      },
      results: {
        ...p.results,
        stats: p.results.stats || [],
        bullets: p.results.bullets || [],
      },
      keyFeatures: (p.keyFeatures || []).map((kf) => ({
        ...kf,
        tag: kf.tag || null,
      })),
      testimonial: p.testimonial
        ? {
            quote: p.testimonial.quote,
            author: p.testimonial.author || null,
            role: p.testimonial.role || null,
            organization: p.testimonial.organization || null,
          }
        : null,
    }));
    setProjects(localProjects);
  }, []);

  const loadLiveContent = useCallback(async () => {
    try {
      const [teamData, blogData, projectData, enquiryData, mediaData] = await Promise.allSettled([
        adminApiClient.listTeam(),
        adminApiClient.listBlogs(),
        adminApiClient.listProjects(),
        adminApiClient.listEnquiries(),
        adminApiClient.listMedia(),
      ]);

      if (teamData.status === "fulfilled") setTeamMembers(teamData.value);
      if (blogData.status === "fulfilled") setBlogs(blogData.value);
      if (projectData.status === "fulfilled") setProjects(projectData.value);
      if (enquiryData.status === "fulfilled") {
        setEnquiries(enquiryData.value.enquiries);
        setEnquiryCounts(enquiryData.value.counts);
      }
      if (mediaData.status === "fulfilled") setMediaAssets(mediaData.value.assets);
    } catch {
      // Fallback to local data
      loadLocalFallback();
    }
  }, [adminApiClient, loadLocalFallback]);

  useEffect(() => {
    if (adminApiAccessState === "authorized" || adminApiAccessState === "authorized-read-only") {
      void loadLiveContent();
    } else {
      loadLocalFallback();
    }
  }, [adminApiAccessState, loadLiveContent, loadLocalFallback]);

  const handleLogout = async () => {
    try {
      await adminApiClient.logout();
      navigate({ to: "/login" });
    } catch (err) {
      showToast(
        err instanceof Error
          ? `Logout failed: ${err.message}`
          : "Unable to sign out from server session. Please try again.",
      );
    }
  };

  const requireWriteAuth = (): boolean => {
    if (adminApiAccessState !== "authorized") {
      showToast(
        "Administrator authentication required: Please sign in to perform write operations.",
      );
      return false;
    }
    return true;
  };

  // ════════════════════════════════════════════════════════════════════════
  // TEAM HANDLERS
  // ════════════════════════════════════════════════════════════════════════

  const handleMemberImageUpload = async (file: File, targetMemberId?: string) => {
    if (!requireWriteAuth()) return;
    try {
      showToast("Uploading member photo to R2...");
      const { url } = await adminApiClient.uploadMedia(file, "team");
      if (targetMemberId) {
        await adminApiClient.updateTeamMember(targetMemberId, { image: url });
        setTeamMembers((prev) =>
          prev.map((m) => (m.id === targetMemberId ? { ...m, image: url } : m)),
        );
        showToast("Member photo updated!");
      } else {
        setNewMemberForm((prev) => ({ ...prev, image: url }));
        showToast("Photo uploaded!");
      }
    } catch (err) {
      showToast(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  };

  const handleSaveAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireWriteAuth()) return;
    try {
      setIsSubmitting(true);
      const created = await adminApiClient.createTeamMember(newMemberForm);
      setTeamMembers((prev) => [...prev, created]);
      setIsAddMemberOpen(false);
      setNewMemberForm({
        name: "",
        role: "",
        borderColor: "#22D3EE",
        image: "",
        sortOrder: teamMembers.length + 1,
      });
      showToast(`Added team member "${created.name}"`);
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to add member"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember || !requireWriteAuth()) return;
    try {
      setIsSubmitting(true);
      const updated = await adminApiClient.updateTeamMember(editingMember.id, editingMember);
      setTeamMembers((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setEditingMember(null);
      showToast(`Updated "${updated.name}"`);
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to update member"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!requireWriteAuth()) return;
    if (!window.confirm(`Are you sure you want to remove team member "${name}"?`)) return;
    try {
      await adminApiClient.deleteTeamMember(id);
      setTeamMembers((prev) => prev.filter((m) => m.id !== id));
      showToast(`Removed "${name}"`);
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to delete"}`);
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // BLOG POST HANDLERS
  // ════════════════════════════════════════════════════════════════════════

  const handleBlogImageUpload = async (file: File, isEdit = false) => {
    if (!requireWriteAuth()) return;
    try {
      showToast("Uploading blog cover to R2...");
      const { url } = await adminApiClient.uploadMedia(file, "blogs");
      if (isEdit && editingBlog) {
        setEditingBlog({ ...editingBlog, image: url });
      } else {
        setNewBlogForm((prev) => ({ ...prev, image: url }));
      }
      showToast("Cover image uploaded!");
    } catch (err) {
      showToast(`Upload failed: ${err instanceof Error ? err.message : "Error"}`);
    }
  };

  const handleSaveAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireWriteAuth()) return;
    try {
      setIsSubmitting(true);
      const created = await adminApiClient.createBlog({
        title: newBlogForm.title,
        category: newBlogForm.category,
        author: newBlogForm.author,
        readTime: newBlogForm.readTime,
        excerpt: newBlogForm.excerpt,
        image: newBlogForm.image,
        featured: newBlogForm.featured,
        keywords: newBlogForm.keywords
          .split(",")
          .map((k) => k.trim())
          .filter(Boolean),
        keyTakeaways: newBlogForm.keyTakeaways
          .split("\n")
          .map((t) => t.trim())
          .filter(Boolean),
        content: newBlogForm.content
          .split("\n\n")
          .map((c) => c.trim())
          .filter(Boolean),
      });
      setBlogs((prev) => [created, ...prev]);
      setIsAddBlogOpen(false);
      showToast(`Published article "${created.title}"`);
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to post blog"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEditBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlog || !requireWriteAuth()) return;
    try {
      setIsSubmitting(true);
      const updated = await adminApiClient.updateBlog(editingBlog.id, editingBlog);
      setBlogs((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
      setEditingBlog(null);
      showToast(`Updated "${updated.title}"`);
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to update blog"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBlog = async (id: string, title: string) => {
    if (!requireWriteAuth()) return;
    if (!window.confirm(`Delete blog post "${title}"?`)) return;
    try {
      await adminApiClient.deleteBlog(id);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      showToast(`Deleted "${title}"`);
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to delete"}`);
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // PROJECT / CASE STUDY HANDLERS
  // ════════════════════════════════════════════════════════════════════════

  const handleProjectImageUpload = async (file: File, isEdit = false) => {
    if (!requireWriteAuth()) return;
    try {
      showToast("Uploading project cover to R2...");
      const { url } = await adminApiClient.uploadMedia(file, "projects");
      if (isEdit && editingProject) {
        setEditingProject({ ...editingProject, coverImage: url });
      } else {
        setNewProjectForm((prev) => ({ ...prev, coverImage: url }));
      }
      showToast("Project cover uploaded!");
    } catch (err) {
      showToast(`Upload failed: ${err instanceof Error ? err.message : "Error"}`);
    }
  };

  const handleSaveAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireWriteAuth()) return;
    try {
      setIsSubmitting(true);
      const statsParsed = newProjectForm.stats.split("\n").map((line) => {
        const parts = line.split("|").map((p) => p.trim());
        return { metric: parts[0] || "", label: parts[1] || "", context: parts[2] || "" };
      });
      const created = await adminApiClient.createProject({
        title: newProjectForm.title,
        slug: newProjectForm.slug,
        shortTitle: newProjectForm.shortTitle || newProjectForm.title,
        category: newProjectForm.category,
        clientName: newProjectForm.clientName,
        clientType: newProjectForm.clientType,
        coverImage: newProjectForm.coverImage,
        timeline: newProjectForm.timeline,
        status: newProjectForm.status,
        featuredOnHome: newProjectForm.featuredOnHome,
        order: newProjectForm.order,
        problem: {
          heading: newProjectForm.problemHeading,
          description: newProjectForm.problemDescription,
          painPoints: newProjectForm.painPoints
            .split("\n")
            .map((p) => p.trim())
            .filter(Boolean),
        },
        solution: {
          heading: newProjectForm.solutionHeading,
          description: newProjectForm.solutionDescription,
          keyDeliverables: newProjectForm.deliverables
            .split("\n")
            .map((d) => d.trim())
            .filter(Boolean),
        },
        stack: newProjectForm.stack
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        architecture: {
          overview: newProjectForm.architectureOverview,
          flowSteps: [
            { step: "01", title: "Intake", description: "System processes client inputs." },
          ],
        },
        results: {
          stats: statsParsed,
          bullets: newProjectForm.bullets
            .split("\n")
            .map((b) => b.trim())
            .filter(Boolean),
        },
        keyFeatures: [
          {
            title: "Core Platform",
            description: "Bespoke solution engineered for speed.",
            tag: "Core",
          },
        ],
        testimonial: newProjectForm.testimonialQuote
          ? {
              quote: newProjectForm.testimonialQuote,
              author: newProjectForm.testimonialAuthor || null,
              role: null,
              organization: newProjectForm.clientName || null,
            }
          : null,
      });

      setProjects((prev) => [...prev, created]);
      setIsAddProjectOpen(false);
      showToast(`Created project "${created.title}"`);
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to create project"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEditProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !requireWriteAuth()) return;
    try {
      setIsSubmitting(true);
      const updated = await adminApiClient.updateProject(editingProject.slug, editingProject);
      setProjects((prev) => prev.map((p) => (p.slug === updated.slug ? updated : p)));
      setEditingProject(null);
      showToast(`Updated project "${updated.title}"`);
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to update project"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (slug: string, title: string) => {
    if (!requireWriteAuth()) return;
    if (!window.confirm(`Delete case study "${title}" and all its records?`)) return;
    try {
      await adminApiClient.deleteProject(slug);
      setProjects((prev) => prev.filter((p) => p.slug !== slug));
      showToast(`Deleted "${title}"`);
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to delete"}`);
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // ENQUIRY HANDLERS
  // ════════════════════════════════════════════════════════════════════════

  const handleUpdateEnquiryStatus = async (id: number, status: string) => {
    if (!requireWriteAuth()) return;
    try {
      const updated = await adminApiClient.updateEnquiryStatus(id, status);
      setEnquiries((prev) => prev.map((e) => (e.id === id ? updated : e)));
      // Refresh counts
      const res = await adminApiClient.listEnquiries(enquiryStatusFilter);
      setEnquiryCounts(res.counts);
      showToast(`Enquiry #${id} marked as ${status}`);
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to update status"}`);
    }
  };

  const handleDeleteEnquiry = async (id: number) => {
    if (!requireWriteAuth()) return;
    if (!window.confirm(`Delete enquiry #${id}?`)) return;
    try {
      await adminApiClient.deleteEnquiry(id);
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      const res = await adminApiClient.listEnquiries(enquiryStatusFilter);
      setEnquiryCounts(res.counts);
      showToast(`Enquiry #${id} deleted`);
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to delete"}`);
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // MEDIA HANDLERS
  // ════════════════════════════════════════════════════════════════════════

  const handleUploadGeneralMedia = async (file: File, folder = "general") => {
    if (!requireWriteAuth()) return;
    try {
      setIsUploadingMedia(true);
      showToast(`Uploading ${file.name} to R2...`);
      await adminApiClient.uploadMedia(file, folder);
      const res = await adminApiClient.listMedia(mediaFolderFilter, mediaSearch);
      setMediaAssets(res.assets);
      showToast("Asset uploaded and cataloged!");
    } catch (err) {
      showToast(`Upload failed: ${err instanceof Error ? err.message : "Error"}`);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleDeleteMedia = async (path: string) => {
    if (!requireWriteAuth()) return;
    if (!window.confirm(`Delete asset "${path}" from R2?`)) return;
    try {
      await adminApiClient.deleteMedia(path);
      setMediaAssets((prev) => prev.filter((a) => a.path !== path));
      showToast(`Deleted ${path}`);
    } catch (err) {
      showToast(`Error: ${err instanceof Error ? err.message : "Failed to delete"}`);
    }
  };

  // ════════════════════════════════════════════════════════════════════════
  // FILTERING
  // ════════════════════════════════════════════════════════════════════════

  const filteredBlogs = blogs.filter((b) => {
    const q = blogSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      b.title.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q)
    );
  });

  const filteredProjects = projects.filter((p) => {
    const q = projectSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      p.title.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const filteredMedia = mediaAssets.filter((a) => {
    const matchesFolder =
      mediaFolderFilter === "all" ||
      a.path.startsWith(`${mediaFolderFilter}/`) ||
      a.entityType === mediaFolderFilter;
    const matchesSearch =
      !mediaSearch ||
      a.fileName.toLowerCase().includes(mediaSearch.toLowerCase()) ||
      a.path.toLowerCase().includes(mediaSearch.toLowerCase());
    return matchesFolder && matchesSearch;
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
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                  adminApiAccessState === "authorized"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-cyan-500/30 bg-cyan-500/10 text-cyan-400"
                }`}
              >
                <ShieldCheck className="h-3 w-3" />
                <span>
                  {adminApiAccessState === "authorized"
                    ? "Verified Administrator"
                    : "Content Preview Mode"}
                </span>
              </span>
              {(adminUsername || adminEmail) && (
                <span className="text-xs text-slate-400">
                  User: <strong className="text-cyan-300">{adminUsername || adminEmail}</strong>
                </span>
              )}
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Tech Agenz Admin Console
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Live Cloudflare D1 database and R2 storage management console.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                const backup = exportCmsData();
                const jsonStr = JSON.stringify(backup, null, 2);
                const blob = new Blob([jsonStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `techagenz-cms-backup-${new Date().toISOString().slice(0, 10)}.json`;
                link.click();
                URL.revokeObjectURL(url);
                showToast("Backup JSON file exported!");
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-3.5 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Backup</span>
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
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-4 py-2 text-xs font-medium text-slate-300 hover:border-cyan-500/40 hover:text-white transition cursor-pointer"
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>

        {/* Security & Access Banner */}
        <div className="mt-5 rounded-xl border border-white/10 bg-slate-900/70 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">
                {authType === "session"
                  ? "Production Administrator Session"
                  : "Cloudflare Access & Zero-Trust Session"}
              </p>
              <p className="mt-1 text-sm text-slate-300 font-mono">
                {adminApiAccessState === "authorized"
                  ? `✓ Active administrator session (${authType === "session" ? "Production Team Session" : "Cloudflare Access"}). Full D1 and R2 write access enabled.`
                  : adminApiAccessState === "authorized-read-only"
                    ? "✓ Authorized Access token detected. Admin CMS operates in read-only mode."
                    : adminApiAccessState === "session-required"
                      ? "⚠ Administrator session required to perform database writes."
                      : adminApiAccessState === "forbidden"
                        ? "✕ Forbidden: Your account is not on the administrator allow-list."
                        : "Checking session..."}
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              {adminApiClient.accessUrl && (
                <button
                  type="button"
                  onClick={() => setAdminApiCheckVersion((v) => v + 1)}
                  disabled={adminApiAccessState === "checking"}
                  className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Verify API Session</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("team")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === "team"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Team Members</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] bg-slate-950/30">
              {teamMembers.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("blogs")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === "blogs"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Blog Articles</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] bg-slate-950/30">
              {blogs.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === "projects"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            <span>Case Studies</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] bg-slate-950/30">
              {projects.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("enquiries")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === "enquiries"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Mail className="h-4 w-4" />
            <span>Enquiries</span>
            {enquiryCounts.new > 0 && (
              <span className="rounded-full px-2 py-0.5 text-[10px] bg-emerald-400 text-slate-950 font-bold">
                {enquiryCounts.new} new
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("media")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === "media"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            <span>Media Library (R2)</span>
            <span className="rounded-full px-2 py-0.5 text-[10px] bg-slate-950/30">
              {mediaAssets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition cursor-pointer shrink-0 ${
              activeTab === "settings"
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>System Status</span>
          </button>
        </div>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 1: TEAM MEMBERS                                          */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === "team" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div>
                <h2 className="text-lg font-bold text-white">Team Directory</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Synchronized with Cloudflare D1{" "}
                  <code className="text-cyan-300">team_members</code>.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:brightness-110 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Team Member</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="group relative rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-lg backdrop-blur-sm transition hover:border-cyan-500/40"
                  style={{ boxShadow: `0 0 25px ${member.borderColor || "#22D3EE"}15` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0 group/photo">
                      <div
                        className="h-20 w-20 rounded-2xl overflow-hidden border-2 bg-slate-900"
                        style={{ borderColor: member.borderColor || "#22D3EE" }}
                      >
                        <img
                          src={member.image || AVATAR_PLACEHOLDER}
                          alt={member.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <label
                        className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/70 opacity-0 group-hover/photo:opacity-100 transition cursor-pointer text-[10px] text-cyan-300 font-medium"
                        title="Upload new photo to R2"
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

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white truncate">{member.name}</h3>
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: member.borderColor || "#22D3EE" }}
                        />
                      </div>
                      <p className="text-xs text-cyan-400 mt-0.5 truncate">{member.role}</p>
                      <p className="text-[11px] text-slate-500 mt-1 font-mono">
                        Order: {member.sortOrder} | ID: {member.id}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setEditingMember(member)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-cyan-500/40 hover:text-white transition cursor-pointer"
                    >
                      <Edit2 className="h-3 w-3" />
                      <span>Edit Member</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member.id, member.name)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
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

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 2: BLOG POSTS                                            */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === "blogs" && (
          <div className="mt-8 space-y-6">
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
                  onClick={() => setIsAddBlogOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:brightness-110 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Post New Blog</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredBlogs.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-sm transition hover:border-cyan-500/40"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <img
                      src={post.image || "/blog-images/default.webp"}
                      alt={post.title}
                      className="h-20 w-28 shrink-0 rounded-xl object-cover border border-white/10 bg-slate-900"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                          {post.category}
                        </span>
                        {post.featured && (
                          <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                            ★ Featured
                          </span>
                        )}
                        <span className="text-[11px] text-slate-500">{post.date}</span>
                        <span className="text-[11px] text-slate-500">• {post.readTime}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                        {post.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">{post.excerpt}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.keywords?.map((k, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-mono bg-white/5 text-slate-400 px-1.5 py-0.5 rounded"
                          >
                            #{k}
                          </span>
                        ))}
                      </div>
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

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 3: CASE STUDIES (PROJECTS)                               */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === "projects" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={projectSearch}
                    onChange={(e) => setProjectSearch(e.target.value)}
                    placeholder="Search projects by title, client, category..."
                    className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddProjectOpen(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:brightness-110 transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Case Study</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {filteredProjects.map((proj) => (
                <div
                  key={proj.slug}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-sm transition hover:border-cyan-500/40"
                >
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <img
                      src={proj.coverImage || "/assets/placeholder-project.webp"}
                      alt={proj.title}
                      className="h-20 w-28 shrink-0 rounded-xl object-cover border border-white/10 bg-slate-900"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-medium text-cyan-400">
                          {proj.category}
                        </span>
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                          {proj.status}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Client: {proj.clientName}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold text-white line-clamp-1">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {proj.problem?.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj.tags?.map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono bg-white/5 text-slate-400 px-1.5 py-0.5 rounded"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-white/5">
                    <Link
                      to="/work/$slug"
                      params={{ slug: proj.slug }}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:border-white/20 transition"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => setEditingProject(proj)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition cursor-pointer"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteProject(proj.slug, proj.title)}
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

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 4: ENQUIRIES INBOX                                       */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === "enquiries" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div>
                <h2 className="text-lg font-bold text-white">Client Enquiries Inbox</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Submissions captured from public forms with Turnstile verification.
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 border border-white/10 rounded-xl p-1">
                {(["all", "new", "read", "replied", "archived"] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={async () => {
                      setEnquiryStatusFilter(st);
                      const res = await adminApiClient.listEnquiries(st);
                      setEnquiries(res.enquiries);
                      setEnquiryCounts(res.counts);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition cursor-pointer ${
                      enquiryStatusFilter === st
                        ? "bg-cyan-500 text-slate-950 font-bold"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st}
                    {st !== "all" && (
                      <span className="ml-1.5 text-[10px] opacity-75">({enquiryCounts[st]})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {enquiries.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-12 text-center text-slate-400">
                  <Mail className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                  <p className="text-sm">No enquiries found in this category.</p>
                </div>
              ) : (
                enquiries.map((enq) => (
                  <div
                    key={enq.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 backdrop-blur-sm transition hover:border-cyan-500/40"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{enq.name}</span>
                        <a
                          href={`mailto:${enq.email}`}
                          className="text-xs text-cyan-400 hover:underline"
                        >
                          {enq.email}
                        </a>
                        {enq.phone && <span className="text-xs text-slate-400">• {enq.phone}</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">{enq.created_at}</span>
                        <select
                          value={enq.status}
                          onChange={(e) => handleUpdateEnquiryStatus(enq.id, e.target.value)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-medium border outline-none cursor-pointer ${
                            enq.status === "new"
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                              : enq.status === "read"
                                ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-400"
                                : enq.status === "replied"
                                  ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                                  : "border-slate-500/40 bg-slate-500/10 text-slate-400"
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                          <option value="archived">Archived</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleDeleteEnquiry(enq.id)}
                          className="rounded-lg p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                          title="Delete enquiry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-400">
                      {enq.company && (
                        <span>
                          Company: <strong className="text-white">{enq.company}</strong>
                        </span>
                      )}
                      {enq.service && (
                        <span>
                          Service: <strong className="text-cyan-300">{enq.service}</strong>
                        </span>
                      )}
                      {enq.budget && (
                        <span>
                          Budget: <strong className="text-emerald-300">{enq.budget}</strong>
                        </span>
                      )}
                    </div>

                    <p className="mt-3 text-xs sm:text-sm text-slate-200 bg-slate-900/60 p-3 rounded-xl border border-white/5 whitespace-pre-wrap leading-relaxed">
                      {enq.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 5: MEDIA ASSETS LIBRARY (R2)                             */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === "media" && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/60 border border-white/10 rounded-2xl p-4 sm:p-5">
              <div>
                <h2 className="text-lg font-bold text-white">R2 Media Assets</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Stored in bucket <code className="text-cyan-300">techagenz-dev-assets</code> and
                  cataloged in D1.
                </p>
              </div>

              {/* Upload Drop Button */}
              <label className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:brightness-110 transition cursor-pointer">
                <Upload className="h-4 w-4" />
                <span>{isUploadingMedia ? "Uploading..." : "Upload Asset to R2"}</span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  disabled={isUploadingMedia}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      handleUploadGeneralMedia(
                        file,
                        mediaFolderFilter === "all" ? "general" : mediaFolderFilter,
                      );
                  }}
                />
              </label>
            </div>

            {/* Folder Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {(["all", "team", "blogs", "projects", "general"] as const).map((folder) => (
                  <button
                    key={folder}
                    type="button"
                    onClick={() => setMediaFolderFilter(folder)}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-medium capitalize transition cursor-pointer ${
                      mediaFolderFilter === folder
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                        : "bg-slate-900/80 text-slate-400 border border-white/5 hover:text-white"
                    }`}
                  >
                    {folder}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  placeholder="Filter media files..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-1.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Media Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMedia.map((asset) => (
                <div
                  key={asset.path}
                  className="group relative rounded-2xl border border-white/10 bg-slate-950/80 p-2.5 backdrop-blur-sm transition hover:border-cyan-500/40 flex flex-col justify-between"
                >
                  <div className="h-28 w-full rounded-xl overflow-hidden bg-slate-900 relative">
                    <img
                      src={asset.url}
                      alt={asset.fileName}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(asset.url);
                        showToast(`Copied URL: ${asset.url}`);
                      }}
                      className="absolute top-2 right-2 rounded-lg bg-black/60 p-1 text-slate-300 hover:text-white transition"
                      title="Copy URL"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="mt-2 text-[11px]">
                    <p className="font-semibold text-white truncate" title={asset.fileName}>
                      {asset.fileName}
                    </p>
                    <p className="text-slate-500 font-mono text-[10px] truncate">{asset.path}</p>
                    {asset.sizeBytes && (
                      <p className="text-[10px] text-slate-400">
                        {(asset.sizeBytes / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteMedia(asset.path)}
                    className="mt-2 flex items-center justify-center gap-1 w-full rounded-lg border border-rose-500/20 py-1 text-[10px] text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 6: SETTINGS & SYSTEM STATUS                              */}
        {/* ════════════════════════════════════════════════════════════ */}
        {activeTab === "settings" && (
          <div className="mt-8 space-y-8">
            <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-slate-950/90 to-slate-900/90 p-6 sm:p-8 backdrop-blur-sm shadow-[0_0_30px_rgba(34,211,238,0.1)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      Cloudflare Production Architecture
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                      Full-stack edge architecture with Worker routing, D1 relational tables, and R2
                      object storage.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-1">
                    <Server className="h-4 w-4" />
                    <span>Cloudflare Worker</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Worker: <code className="text-cyan-300">techagenz-api-dev</code>
                  </p>
                  <span className="inline-block mt-2 text-[10px] text-emerald-400 font-mono bg-emerald-400/10 px-2 py-0.5 rounded">
                    Active on api-dev.techagenz.com
                  </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-1">
                    <Database className="h-4 w-4" />
                    <span>D1 Relational Database</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Database: <code className="text-cyan-300">techagenz-dev-db</code>
                  </p>
                  <span className="inline-block mt-2 text-[10px] text-emerald-400 font-mono bg-emerald-400/10 px-2 py-0.5 rounded">
                    Schemas Active (0001, 0002, 0003)
                  </span>
                </div>

                <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-1">
                    <ImageIcon className="h-4 w-4" />
                    <span>R2 Object Storage</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Bucket: <code className="text-cyan-300">techagenz-dev-assets</code>
                  </p>
                  <span className="inline-block mt-2 text-[10px] text-emerald-400 font-mono bg-emerald-400/10 px-2 py-0.5 rounded">
                    Public Reads + Authenticated Writes
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════════════════════════════ */}
        {/* MODAL: ADD TEAM MEMBER                                       */}
        {/* ════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {isAddMemberOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-slate-950 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
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
                          <span>Choose Photo</span>
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
                      value={newMemberForm.name}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, name: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Role / Designation
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Senior Security Architect"
                      value={newMemberForm.role}
                      onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Accent Color
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          onClick={() =>
                            setNewMemberForm({ ...newMemberForm, borderColor: color.hex })
                          }
                          className={`h-7 w-7 rounded-full border-2 transition cursor-pointer ${
                            newMemberForm.borderColor === color.hex
                              ? "border-white scale-110"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: color.hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddMemberOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition cursor-pointer disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      <span>{isSubmitting ? "Saving..." : "Save Member"}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* MODAL: EDIT TEAM MEMBER                                      */}
        {/* ════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {editingMember && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-slate-950 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
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
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMember.name}
                      onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Role / Designation
                    </label>
                    <input
                      type="text"
                      required
                      value={editingMember.role}
                      onChange={(e) => setEditingMember({ ...editingMember, role: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      value={editingMember.sortOrder}
                      onChange={(e) =>
                        setEditingMember({
                          ...editingMember,
                          sortOrder: parseInt(e.target.value, 10) || 1,
                        })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingMember(null)}
                      className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition cursor-pointer disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      <span>{isSubmitting ? "Saving..." : "Update Member"}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* MODAL: ADD BLOG POST                                         */}
        {/* ════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {isAddBlogOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl rounded-2xl border border-cyan-500/30 bg-slate-950 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-cyan-400" />
                    <span>Create New Blog Post</span>
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
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Article Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. The Future of AI Agents in Production"
                      value={newBlogForm.title}
                      onChange={(e) => setNewBlogForm({ ...newBlogForm, title: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Category
                      </label>
                      <select
                        value={newBlogForm.category}
                        onChange={(e) =>
                          setNewBlogForm({ ...newBlogForm, category: e.target.value })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white outline-none focus:border-cyan-500"
                      >
                        {blogCategories
                          .filter((c) => c !== "All")
                          .map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
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
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-sm text-white outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>

                  {/* Cover Image Upload */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Cover Image
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newBlogForm.image}
                        onChange={(e) => setNewBlogForm({ ...newBlogForm, image: e.target.value })}
                        placeholder="/blog-images/cover.webp or R2 URL"
                        className="flex-1 rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white outline-none"
                      />
                      <label className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload to R2</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleBlogImageUpload(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Short Excerpt
                    </label>
                    <textarea
                      rows={2}
                      value={newBlogForm.excerpt}
                      onChange={(e) => setNewBlogForm({ ...newBlogForm, excerpt: e.target.value })}
                      placeholder="Brief overview summary..."
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Keywords (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newBlogForm.keywords}
                      onChange={(e) => setNewBlogForm({ ...newBlogForm, keywords: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2 px-3 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Key Takeaways (one per line)
                    </label>
                    <textarea
                      rows={3}
                      value={newBlogForm.keyTakeaways}
                      onChange={(e) =>
                        setNewBlogForm({ ...newBlogForm, keyTakeaways: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2 px-3 text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Article Content (double line break between paragraphs)
                    </label>
                    <textarea
                      rows={6}
                      value={newBlogForm.content}
                      onChange={(e) => setNewBlogForm({ ...newBlogForm, content: e.target.value })}
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white outline-none font-mono"
                    />
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddBlogOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition cursor-pointer disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      <span>{isSubmitting ? "Publishing..." : "Publish Post"}</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* MODAL: ADD CASE STUDY                                        */}
        {/* ════════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {isAddProjectOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-3xl rounded-2xl border border-cyan-500/30 bg-slate-950 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Plus className="h-5 w-5 text-cyan-400" />
                    <span>Create Case Study</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddProjectOpen(false)}
                    className="rounded-lg p-1 text-slate-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveAddProject} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Title
                      </label>
                      <input
                        type="text"
                        required
                        value={newProjectForm.title}
                        onChange={(e) =>
                          setNewProjectForm({ ...newProjectForm, title: e.target.value })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. apex-audit-portal"
                        value={newProjectForm.slug}
                        onChange={(e) =>
                          setNewProjectForm({ ...newProjectForm, slug: e.target.value })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Client Name
                      </label>
                      <input
                        type="text"
                        required
                        value={newProjectForm.clientName}
                        onChange={(e) =>
                          setNewProjectForm({ ...newProjectForm, clientName: e.target.value })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2 px-3 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Category
                      </label>
                      <input
                        type="text"
                        value={newProjectForm.category}
                        onChange={(e) =>
                          setNewProjectForm({ ...newProjectForm, category: e.target.value })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2 px-3 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Timeline
                      </label>
                      <input
                        type="text"
                        value={newProjectForm.timeline}
                        onChange={(e) =>
                          setNewProjectForm({ ...newProjectForm, timeline: e.target.value })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2 px-3 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Cover Image */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Cover Image URL
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={newProjectForm.coverImage}
                        onChange={(e) =>
                          setNewProjectForm({ ...newProjectForm, coverImage: e.target.value })
                        }
                        placeholder="/assets/cover.webp"
                        className="flex-1 rounded-xl border border-white/10 bg-slate-900/90 py-2.5 px-3.5 text-xs text-white outline-none"
                      />
                      <label className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2.5 text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 cursor-pointer">
                        <Upload className="h-3.5 w-3.5" />
                        <span>Upload to R2</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleProjectImageUpload(file);
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                      Tech Stack (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newProjectForm.stack}
                      onChange={(e) =>
                        setNewProjectForm({ ...newProjectForm, stack: e.target.value })
                      }
                      className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2 px-3 text-xs text-white outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Problem Description
                      </label>
                      <textarea
                        rows={3}
                        value={newProjectForm.problemDescription}
                        onChange={(e) =>
                          setNewProjectForm({
                            ...newProjectForm,
                            problemDescription: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2 px-3 text-xs text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                        Solution Description
                      </label>
                      <textarea
                        rows={3}
                        value={newProjectForm.solutionDescription}
                        onChange={(e) =>
                          setNewProjectForm({
                            ...newProjectForm,
                            solutionDescription: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900/90 py-2 px-3 text-xs text-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setIsAddProjectOpen(false)}
                      className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-5 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition cursor-pointer disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" />
                      <span>{isSubmitting ? "Creating..." : "Save Case Study"}</span>
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
