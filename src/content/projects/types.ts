export interface CaseStudyArchitectureStep {
  step: string;
  title: string;
  description: string;
}

export interface CaseStudySeo {
  title?: string;
  description?: string;
}

export interface CaseStudy {
  slug: string;
  title: string;
  shortTitle: string;
  formulaSummary: string;
  clientType: string;
  clientName: string;
  category: string;
  coverImage: string;
  coverImageAlt?: string;
  tags: string[];
  featuredOnHome: boolean;
  order: number;
  timeline: string;
  status: string;
  problem: {
    heading: string;
    description: string;
    painPoints: string[];
  };
  solution: {
    heading: string;
    description: string;
    keyDeliverables: string[];
  };
  stack: string[];
  architecture: {
    overview: string;
    flowSteps: CaseStudyArchitectureStep[];
  };
  results: {
    stats: Array<{ metric: string; label: string; context: string }>;
    bullets: string[];
  };
  keyFeatures: Array<{
    title: string;
    description: string;
    tag: string | null;
  }>;
  testimonial: {
    quote: string;
    author: string | null;
    role: string | null;
    organization: string | null;
  } | null;
  seo?: CaseStudySeo;
}
