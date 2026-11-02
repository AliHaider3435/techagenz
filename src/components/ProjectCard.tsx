import { Link } from "@tanstack/react-router";
import { ArrowUpRight, CheckCircle2, Layers } from "lucide-react";
import type { CaseStudy } from "@/lib/projects-data";

interface ProjectCardProps {
  project: CaseStudy;
  priority?: boolean;
}

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  return (
    <article
      data-cursor="hover"
      className="group flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md transition-all duration-300 hover:border-brand/40 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-brand/5"
    >
      <div className="flex flex-1 flex-col">
        {/* 16:9 Thumbnail Cover Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-950 shrink-0">
          <img
            src={project.coverImage}
            alt={project.title}
            width={720}
            height={405}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />

          {/* Category Badge & Live Status */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span className="rounded-full bg-slate-950/80 px-3 py-1 text-xs font-semibold text-brand border border-brand/20 backdrop-blur-md">
              {project.category}
            </span>
          </div>

          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/80 px-2.5 py-1 text-[11px] font-medium text-emerald-400 border border-emerald-500/30 backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {project.timeline}
            </span>
          </div>

          {/* Quick Metrics Bar at Bottom of Image */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-foreground/80">
            <span className="font-mono text-xs font-semibold text-brand">
              {project.results.stats[0]?.metric} {project.results.stats[0]?.label}
            </span>
            <span className="text-muted-foreground">{project.clientType}</span>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col justify-between p-6">
          <div className="space-y-3">
            {/* Title in required format: Project Name: What It Is, Said Plainly */}
            <h3 className="font-display text-lg font-bold leading-snug text-foreground group-hover:text-brand transition-colors line-clamp-2 min-h-[3.25rem]">
              <Link to="/work/$slug" params={{ slug: project.slug }}>
                {project.title}
              </Link>
            </h3>

            {/* One paragraph in required formula */}
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-4 min-h-[5rem]">
              {project.formulaSummary}
            </p>
          </div>

          {/* Stack Chips */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-2">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-secondary/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground border border-border/50"
              >
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="rounded-md bg-secondary/30 px-2 py-0.5 text-[11px] text-muted-foreground/70">
                +{project.tags.length - 3} more
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer: View Project Link */}
      <div className="border-t border-border/50 p-6 pt-4 flex items-center justify-between shrink-0 mt-auto">
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>{project.results.stats[1]?.metric} {project.results.stats[1]?.label}</span>
        </div>

        <Link
          to="/work/$slug"
          params={{ slug: project.slug }}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand transition-all duration-200 group-hover:translate-x-1 hover:underline"
        >
          <span>View Project</span>
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}

export default ProjectCard;
