export interface HomepageBlogCard {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
}

export const homepageBlogPosts: HomepageBlogCard[] = [
  {
    id: "software-house-in-pakistan-guide",
    title:
      "Software House in Pakistan: Services, Benefits, and How to Choose the Right Technology Partner",
    category: "Custom Software",
    readTime: "9 min read",
    date: "November 23, 2026",
    image: "/blog-images/software-house-in-pakistan-guide.webp",
  },
  {
    id: "software-house-lahore-guide",
    title: "How to Choose a Software House in Lahore: A Practical Buyer’s Guide",
    category: "Custom Software",
    readTime: "7 min read",
    date: "November 21, 2026",
    image: "/blog-images/software-house-illustrations.svg#software-house-lahore",
  },
  {
    id: "software-development-cost-pakistan",
    title: "Custom Software Development Cost in Pakistan: What Shapes Your Estimate?",
    category: "Custom Software",
    readTime: "7 min read",
    date: "November 20, 2026",
    image: "/blog-images/software-house-illustrations.svg#development-cost",
  },
];
