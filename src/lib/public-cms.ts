import { cmsClient, type CmsBlogListPost } from "../api/cms-client.ts";
import { DEFAULT_TEAM, sanitizeTeamMember } from "./cms-store.ts";
import { blogPosts, type BlogPost } from "./blogs-data.ts";
import { projects } from "./projects-data.ts";
import { createPublicCmsDataSource, type PublicCmsFallbacks } from "./cms-data-source.ts";

export {
  filterBlogPosts,
  filterProjectsByCategory,
  getFeaturedHomepageProjects,
  getRelatedCmsBlogs,
  getRelatedCmsProjects,
  resolveCmsImageUrl,
} from "./cms-data-source.ts";

function toBlogListPost(post: BlogPost): CmsBlogListPost {
  return {
    id: post.id,
    title: post.title,
    category: post.category,
    readTime: post.readTime,
    date: post.date,
    publishDateIso: post.publishDateIso,
    author: post.author,
    image: post.image,
    excerpt: post.excerpt,
    featured: post.featured === true,
    keywords: [...post.keywords],
  };
}

export function createPublicCmsFallbacks(): PublicCmsFallbacks {
  return {
    team: DEFAULT_TEAM.map((member, sortOrder) => ({
      ...sanitizeTeamMember(member),
      sortOrder,
    })),
    blogs: blogPosts.map((post) => ({
      ...toBlogListPost(post),
      keyTakeaways: [...post.keyTakeaways],
      content: [...post.content],
    })),
    projects: projects.map((project) => ({
      ...project,
      keyFeatures: project.keyFeatures.map((feature) => ({ ...feature, tag: feature.tag ?? null })),
      testimonial: project.testimonial
        ? {
            quote: project.testimonial.quote,
            author: project.testimonial.author,
            role: project.testimonial.role,
            organization: project.testimonial.organization,
          }
        : null,
    })),
  };
}

export const publicCms = createPublicCmsDataSource(cmsClient, createPublicCmsFallbacks());
