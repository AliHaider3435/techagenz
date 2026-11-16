export interface BlogSeo {
  title?: string;
  description?: string;
  keywords?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  publishDateIso: string;
  author: string;
  excerpt: string;
  image: string;
  imageAlt?: string;
  keywords: string[];
  keyTakeaways: string[];
  content: string[];
  featured?: boolean;
  seo?: BlogSeo;
}
