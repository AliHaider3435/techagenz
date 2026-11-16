import type { CaseStudy } from "./types";

const projectModules = import.meta.glob<CaseStudy>("./*.json", {
  eager: true,
  import: "default",
});

export type { CaseStudy } from "./types";

export const projectCategories = [
  "All",
  "Booking Systems & Automation",
  "Legal Tech",
  "Healthcare",
] as const;

export const projects = Object.values(projectModules).sort((a, b) => a.order - b.order);

export function getProjectBySlug(slug: string): CaseStudy | undefined {
  return projects.find((project) => project.slug === slug);
}

export function filterProjectsByCategory(projectsToFilter: CaseStudy[], category: string) {
  return category === "All"
    ? projectsToFilter
    : projectsToFilter.filter((project) => project.category === category);
}

export function getFeaturedHomepageProjects(projectsToFilter: CaseStudy[]): CaseStudy[] {
  return projectsToFilter.filter((project) => project.featuredOnHome);
}

export function getRelatedProjects(slug: string, limit = 2): CaseStudy[] {
  return projects.filter((project) => project.slug !== slug).slice(0, limit);
}
